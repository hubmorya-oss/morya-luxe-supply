import { spawn, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const lockPath = path.join(projectRoot, ".next", "dev", "lock");
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const DEV_PORTS = [3000, 3001];
const normalizedRoot = path.normalize(projectRoot).toLowerCase();

function log(message) {
  console.log(`[dev-fresh] ${message}`);
}

function isProjectNextProcess(commandLine) {
  if (!commandLine) return false;

  const normalizedCmd = path.normalize(commandLine).toLowerCase();
  if (!normalizedCmd.includes(normalizedRoot)) return false;

  return (
    normalizedCmd.includes(`${path.sep}next${path.sep}`) ||
    normalizedCmd.includes("start-server.js") ||
    /\bnext(\.cmd|\.exe)?\b/.test(normalizedCmd)
  );
}

function readLockPid() {
  try {
    const raw = fs.readFileSync(lockPath, "utf8");
    const lock = JSON.parse(raw);
    return typeof lock.pid === "number" ? lock.pid : Number.parseInt(lock.pid, 10);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    log(`Could not read lock file: ${error.message}`);
    return null;
  }
}

function getPidsListeningOnPorts(ports) {
  const pids = new Set();

  try {
    const output = execSync("netstat -ano", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    for (const line of output.split(/\r?\n/)) {
      if (!/\bLISTENING\b/i.test(line)) continue;

      for (const port of ports) {
        if (!new RegExp(`:${port}\\s`).test(line)) continue;

        const parts = line.trim().split(/\s+/);
        const pid = Number.parseInt(parts.at(-1), 10);
        if (Number.isInteger(pid) && pid > 0) {
          pids.add(pid);
        }
      }
    }
  } catch (error) {
    log(`Could not inspect listening ports: ${error.message}`);
  }

  return pids;
}

function getProcessCommandLine(pid) {
  if (process.platform === "win32") {
    try {
      const ps = `(Get-CimInstance Win32_Process -Filter "ProcessId=${pid}").CommandLine`;
      const output = execSync(`powershell -NoProfile -Command "${ps}"`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      return output || null;
    } catch {
      return null;
    }
  }

  try {
    return fs.readFileSync(`/proc/${pid}/cmdline`, "utf8").replace(/\0/g, " ").trim() || null;
  } catch {
    return null;
  }
}

function findProjectNextPids() {
  const pids = new Set();

  if (process.platform === "win32") {
    const rootForPs = projectRoot.replace(/'/g, "''");
    const ps = [
      "Get-CimInstance Win32_Process",
      "| Where-Object {",
      "$_.CommandLine -and",
      `$_.CommandLine -like '*${rootForPs}*' -and`,
      "($_.CommandLine -like '*\\\\next\\\\*' -or $_.CommandLine -like '*start-server.js*')",
      "}",
      "| ForEach-Object { $_.ProcessId }",
    ].join(" ");

    try {
      const output = execSync(`powershell -NoProfile -Command "${ps}"`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });

      for (const line of output.split(/\r?\n/)) {
        const pid = Number.parseInt(line.trim(), 10);
        if (Number.isInteger(pid) && pid > 0) {
          pids.add(pid);
        }
      }
    } catch (error) {
      log(`Could not scan project processes: ${error.message}`);
    }

    return pids;
  }

  try {
    for (const entry of fs.readdirSync("/proc", { withFileTypes: true })) {
      if (!entry.isDirectory() || !/^\d+$/.test(entry.name)) continue;

      const pid = Number.parseInt(entry.name, 10);
      const commandLine = getProcessCommandLine(pid);
      if (isProjectNextProcess(commandLine)) {
        pids.add(pid);
      }
    }
  } catch (error) {
    log(`Could not scan project processes: ${error.message}`);
  }

  return pids;
}

function killProcessTree(pid) {
  if (!Number.isInteger(pid) || pid <= 0 || pid === process.pid) return false;

  try {
    if (process.platform === "win32") {
      execSync(`taskkill /PID ${pid} /F /T`, { stdio: "ignore" });
    } else {
      process.kill(-pid, "SIGTERM");
    }
    return true;
  } catch {
    try {
      process.kill(pid, "SIGKILL");
      return true;
    } catch {
      return false;
    }
  }
}

function removeDevLock() {
  try {
    fs.unlinkSync(lockPath);
    log("Removed stale .next/dev/lock");
  } catch (error) {
    if (error.code !== "ENOENT") {
      log(`Could not remove lock file: ${error.message}`);
    }
  }
}

function killStaleDevServers() {
  const candidates = new Set(findProjectNextPids());

  const lockPid = readLockPid();
  if (lockPid) candidates.add(lockPid);

  for (const pid of getPidsListeningOnPorts(DEV_PORTS)) {
    const commandLine = getProcessCommandLine(pid);
    if (isProjectNextProcess(commandLine)) {
      candidates.add(pid);
    }
  }

  candidates.delete(process.pid);

  if (candidates.size === 0) {
    log("No stale Next.js dev processes found for this project");
    removeDevLock();
    return;
  }

  let killedAny = false;
  for (const pid of candidates) {
    const commandLine = getProcessCommandLine(pid);
    if (!isProjectNextProcess(commandLine)) continue;

    if (killProcessTree(pid)) {
      killedAny = true;
      log(`Killed stale dev process PID ${pid}`);
    }
  }

  if (killedAny) {
    removeDevLock();
  } else {
    log("Found candidate PIDs, but none matched this project's Next.js dev server");
    removeDevLock();
  }
}

function startNextDev() {
  const args = [nextBin, "dev", ...process.argv.slice(2)];
  const child = spawn(process.execPath, args, {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
    shell: false,
  });

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => forwardSignal(signal));
  }

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

killStaleDevServers();
startNextDev();
