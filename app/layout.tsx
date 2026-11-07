import type { Metadata } from 'next'
import localFont from "next/font/local"
import './globals.css'

// Local font files (no network needed at build time)
const geistSans = localFont({
  src: "../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-sans",
  weight: "100 900",
})

const geistMono = localFont({
  src: "../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://djorqueradev.github.io'),
  title: 'Diego Jorquera — Software, IoT & Apps',
  description: 'Portfolio of Diego Jorquera, Computer Engineering student at Universidad Andrés Bello (Santiago, Chile). IoT hardware and firmware, backends and data pipelines, iOS and web apps.',
  keywords: ['Diego Jorquera', 'Software Engineer', 'IoT', 'ESP32', 'SwiftUI', 'FastAPI', 'Next.js', 'Santiago', 'Chile', 'UNAB'],
  authors: [{ name: 'Diego Jorquera' }],
  openGraph: {
    title: 'Diego Jorquera — Software, IoT & Apps',
    description: 'IoT, backend and app projects — from the sensor to the app.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['es_CL'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
