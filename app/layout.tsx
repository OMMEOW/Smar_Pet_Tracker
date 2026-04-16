import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guardian Kinetic | IoT Dog Tracking",
  description: "High-end dog tracking system with breathing precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body>
        {children}
      </body>
    </html>
  );
}
