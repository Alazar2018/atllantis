import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CartProvider } from '@/contexts/CartContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Atlantic Leather - Premium Leather Products',
  description: 'Atlantic Leather has been crafting high-quality leather footwear and products for over 18 years. Premium leather bags, shoes, belts, gloves, and accessories.',
  icons: {
    icon: '/fav-icon.png',
    shortcut: '/fav-icon.png',
    apple: '/fav-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`} suppressHydrationWarning={true}>
        <CartProvider>
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
