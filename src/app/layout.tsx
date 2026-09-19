import type { Metadata } from "next";
import Script from "next/script";
import { Cinzel, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { SITE_URL, WHATSAPP_DISPLAY } from "@/lib/config";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Morya Luxe Supply | Premier Wholesale Barber & Salon Equipment",
  description:
    "India's exclusive B2B wholesale platform for professional barbers and salons. Factory-direct clippers, Japanese steel shears, salon chairs, and grooming supplies with GST invoicing and Pan-India dispatch.",
  keywords: [
    "barber wholesale supply India",
    "salon equipment wholesale",
    "professional hair clippers bulk",
    "Japanese shears barber",
    "Morya Luxe Supply",
    "salon furniture wholesale",
    "barber supplies online India",
  ],
  icons: {
    icon: "/images/icon.svg",
    apple: "/images/icon.svg",
  },
  openGraph: {
    title: "Morya Luxe Supply | Wholesale Barber & Salon Equipment",
    description:
      "Direct B2B wholesale rates on professional barber tools, clippers, shears, and salon equipment across India.",
    url: SITE_URL,
    siteName: "Morya Luxe Supply",
    images: [
      {
        url: "/images/hero-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Morya Luxe Supply Luxury Barber Equipment",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Morya Luxe Supply",
      url: SITE_URL,
      logo: `${SITE_URL}/images/icon.svg`,
      description:
        "India's B2B wholesale platform for professional barber and salon equipment with GST invoicing and Pan-India dispatch.",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: WHATSAPP_DISPLAY,
        contactType: "sales",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Morya Luxe Supply",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${plusJakarta.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover"
        />
        <link rel="icon" href="/images/icon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
