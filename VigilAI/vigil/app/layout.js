import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VigilAI",
  description: "Be Vigilant, Be Safe",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* This turns the entire page into a grid with 3 rows:
        - auto: The Navbar takes the height it needs.
        - 1fr: The main content takes all remaining space.
        - auto: The Footer takes the height it needs.
      */}
      <body className={`${inter.className} grid grid-rows-[auto_1fr_auto] min-h-screen`}>
        <Navbar />

        {/* This is now a grid item that grows. It no longer needs min-h-screen. */}
        <main className="relative">
          <div className="absolute top-0 left-0 z-[-1] w-full h-full bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]"></div>
          
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}