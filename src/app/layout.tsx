import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { WalletProvider } from "@/contexts/wallet-context"
import { ApiProvider } from "@/contexts/api-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RIFFblock - Own the Future of Music",
  description:
    "RIFFblock is revolutionizing how artists create, distribute, and monetize music through blockchain technology.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApiProvider>
          <WalletProvider>
            {children}
            <Toaster />
          </WalletProvider>
        </ApiProvider>
      </body>
    </html>
  )
}
