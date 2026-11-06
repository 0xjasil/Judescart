import { brand } from "@/constants/values";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="text-gray-300 border-t border-white/10"
      style={{ backgroundColor: brand.primaryDark }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        


        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* LEFT: Brand + Description + Social */}
          <div className="lg:col-span-2 space-y-8 flex flex-col items-start">
            <div className="text-left">
              <Link href="/">
                <Image
                  src="/logo-white.png"
                  alt="Logo"
                  width={180}
                  height={32}
                  className="h-8 md:h-10 w-auto mb-6 mx-0 object-contain"
                  priority
                />
              </Link>
              <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                Your trusted partner for quality products. We deliver excellence
                with every purchase, ensuring customer satisfaction and premium quality.
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 justify-start">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
              >
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5 text-gray-400 hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
              >
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5 text-gray-400 hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.012 3.855.06 1.07.049 1.815.27 2.45.517a4.832 4.832 0 011.77 1.15 4.832 4.832 0 011.15 1.77c.247.635.468 1.38.517 2.45.048 1.071.06 1.425.06 3.855s-.012 2.784-.06 3.855c-.049 1.07-.27 1.815-.517 2.45a4.832 4.832 0 01-1.15 1.77 4.832 4.832 0 01-1.77 1.15c-.635.247-1.38.468-2.45.517-1.07.048-1.425.06-3.855.06s-2.784-.012-3.855-.06c-1.07-.049-1.815-.27-2.45-.517a4.832 4.832 0 01-1.77-1.15 4.832 4.832 0 01-1.15-1.77c-.247-.635-.468-1.38-.517-2.45-.048-1.071-.06-1.425-.06-3.855s.012-2.784.06-3.855c.049-1.07.27-1.815.517-2.45a4.832 4.832 0 011.15-1.77 4.832 4.832 0 011.77-1.15c.635-.247 1.38-.468 2.45-.517 1.07-.048 1.425-.06 3.855-.06zm-1.012 2c-2.316 0-2.61.01-3.522.051-.876.04-1.353.18-1.67.304-.42.163-.72.358-1.035.673-.315.316-.51.615-.673 1.036-.123.316-.264.793-.304 1.67-.041.91-.051 1.205-.051 3.522 0 2.316.01 2.61.051 3.522.04.876.18 1.353.304 1.67.163.42.358.72.673 1.035.316.315.615.51 1.036.673.316.123.793.264 1.67.304.91.041 1.205.051 3.522.051 2.316 0 2.61-.01 3.522-.051.876-.04 1.353-.18 1.67-.304.42-.163.72-.358 1.035-.673.315-.316.51-.615.673-1.036.123-.316.264-.793.304-1.67.041-.91.051-1.205.051-3.522 0-2.316-.01-2.61-.051-3.522-.04-.876-.18-1.353-.304-1.67-.163-.42-.358-.72-.673-1.035-.316-.315-.615-.51-1.036-.673-.316-.123-.793-.264-1.67-.304-.91-.041-1.205-.051-3.522-.051zM12 7c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0 2c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm4.804-2a1.202 1.202 0 11-1.202 1.202A1.202 1.202 0 0116.804 7z" />
                </svg>
              </a>
            </div>
          </div>

          {/* RIGHT: Links + Contact */}
          <div className="grid grid-cols-2 gap-10 lg:col-span-2">
            
            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Quick Links
              </h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                <li><Link href="#" className="hover:text-white transition">Shop</Link></li>
                <li><Link href="/our-story" className="hover:text-white transition">Our Story</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition">About Us</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Get in Touch
              </h4>

              <div className="space-y-4 text-sm text-gray-400">
                
                <div className="flex gap-3">
                  <svg className="h-5 w-5 mt-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
                    <path strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>
                    123 Business Street <br />
                    City, State 12345
                  </span>
                </div>

                <div className="flex gap-3 items-center">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={2} d="M3 5a2 2 0 012-2h3.28l1.5 4.5-2.3 1.1a11 11 0 005.5 5.5l1.1-2.3 4.5 1.5V19a2 2 0 01-2 2h-1C9.7 21 3 14.3 3 6V5z"/>
                  </svg>
                  <span>+91 90370 64460</span>
                </div>

                <div className="flex gap-3 items-center">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={2} d="M3 8l9 5 9-5"/>
                    <path strokeWidth={2} d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span>info@stevejohn.com</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          
          <p>© {new Date().getFullYear()} All rights reserved.</p>

          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition">Cookie Policy</Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
