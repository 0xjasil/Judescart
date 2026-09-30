import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { OrderProvider } from "@/context/OrderContext";
import { WishlistProvider } from "@/context/WishlistContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "JudesCart | Shop More. Live Better. - All Products Superstore",
  description: "Shop all products at JudesCart. Discover top-rated electronics, tech gear, premium apparel, footwear, leather goods, smart home essentials, and beauty items with transparent weekly lucky draw rewards.",
  icons: {
    icon: "/logo-icon.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] text-[#111111] selection:bg-[#DF9F28] selection:text-[#111111]">
        <CartProvider>
          <WishlistProvider>
            <OrderProvider>
              {children}
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
