import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://moryaluxesupply.com"),
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
    "barber supplies online India"
  ],
  icons: {
    icon: "/images/icon.svg",
    apple: "/images/icon.svg",
  },
  openGraph: {
    title: "Morya Luxe Supply | Wholesale Barber & Salon Equipment",
    description:
      "Direct B2B wholesale rates on professional barber tools, clippers, shears, and salon equipment across India.",
    url: "https://moryaluxesupply.com",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="icon" href="/images/icon.svg" type="image/svg+xml" />
      </head>
      <body>
        {children}
        {/* Razorpay Checkout SDK */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
