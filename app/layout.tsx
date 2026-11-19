import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suraksha Saathi — सुरक्षा साथी",
  description: "Cyber fraud awareness and training for senior citizens. Marathi-first scam fire-drill.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mr" className="h-full">
      <body className="min-h-full bg-gray-50">{children}</body>
    </html>
  );
}
