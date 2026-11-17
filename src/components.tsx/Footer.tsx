import React from "react";
import Link from "next/link";
import { Building2, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-800 flex items-center justify-center text-white font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Real<span className="text-green-600">State</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            India's modern real estate platform. Discover verified residential and
            commercial properties, schedule in-person viewings, and list properties directly.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Explore
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/properties?type=apartment" className="hover:text-white transition">
                Apartments & Flats
              </Link>
            </li>
            <li>
              <Link href="/properties?type=villa" className="hover:text-white transition">
                Independent Villas
              </Link>
            </li>
            <li>
              <Link href="/properties?type=plot" className="hover:text-white transition">
                Residential Plots
              </Link>
            </li>
            <li>
              <Link href="/properties?type=commercial" className="hover:text-white transition">
                Commercial Spaces
              </Link>
            </li>
          </ul>
        </div>

        {/* Features & Dashboard */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Platform
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/properties/new" className="hover:text-white transition">
                Post Property Free
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-white transition">
                User Dashboard
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition">
                Contact &amp; Support
              </Link>
            </li>
            <li>
              <Link href="/ai-hub" className="hover:text-white transition">
                AI Property Hub
              </Link>
            </li>
            <li>
              <Link href="/properties" className="hover:text-white transition">
                Search Listings
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Support
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-green-400" />
              <span>support@realstate@gmail.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-green-400" />
              <span>faishalsheikh0@gmail.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-green-400" />
              <span>+91 81033 90086</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-green-400" />
              <span>Indore, India</span>
            </li>
            
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>&copy; 2026  RealEstate. All rights reserved.</p>
        <p className="flex items-center gap-4">
          <span>Student Fullstack Project</span>
          <span>&bull;</span>
          <span>React &bull; Next.js &bull; Node &bull; MongoDB</span>
        </p>
      </div>
    </footer>
  );
}
