import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Apis } from "./utils/configs/proyectCurrent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Granja de Oro",
//   description: "Joven Emprendedor",
// };

export const metadata = {
  metadataBase: new URL(`https://${Apis.PROYECTCURRENT_NAMEDOMINIO}.inmunoz.com`), // Aquí colocas tu dominio
  // metadataBase: new URL('http://localhost:3000'), // Aquí colocas tu dominio
  title: "Granja de Oro",
  description: Apis.NAME_PROYECT,
  openGraph: {
    title: "Granja de Oro",
    description: Apis.NAME_PROYECT,
    // url: 'https://inmobackend.site',
    url: `https://${Apis.PROYECTCURRENT_NAMEDOMINIO}.inmunoz.com`,
    type: 'website',
    images: [
      {
        url: "https://serverimages.inmobackend.site/uploads/1751606623128-logo.jpg"
, // Next.js ahora resolverá automáticamente la URL completa
        width: 1200,
        height: 630,
        alt: 'Vista previa de Granja de Oro'
      }
    ]
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
