import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";

import { getSettings } from "@/lib/settings";
import { AppConfig } from "@/app.config";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings?.siteTitle || AppConfig.siteTitle;
  const description = AppConfig.description;
  const imageUrl = "/images/Promotional_header_for_UBDM_Course_202607262117.jpeg";

  return {
    metadataBase: new URL(process.env.APP_URL || "https://theubdmcourse.online"),
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: "/",
      siteName: title,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [imageUrl],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: title,
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png' }
      ],
    },
    manifest: '/site.webmanifest',
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased h-full">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
