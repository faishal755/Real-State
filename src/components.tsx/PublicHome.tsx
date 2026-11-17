"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building,
  Building2,
  CalendarCheck,
  CheckCircle,
  ChevronRight,
  Compass,
  Home,
  MapPin,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const POPULAR_CITIES = [
  "Mumbai",
  "Bengaluru",
  "Delhi NCR",
  "Hyderabad",
  "Pune",
  "Chennai",
];

const PROPERTY_TYPES = [
  { label: "All Types", value: "" },
  { label: "Apartment", value: "apartment" },
  { label: "Villa", value: "villa" },
  { label: "Plot", value: "plot" },
  { label: "Commercial", value: "commercial" },
];

export default function PublicHome() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (listingType) params.append("listingType", listingType);
    if (city.trim()) params.append("city", city.trim());
    if (propertyType) params.append("propertyType", propertyType);
    router.push(`/properties?${params.toString()}`);
  };

  const handleCityClick = (cityName: string) => {
    router.push(`/properties?city=${encodeURIComponent(cityName)}`);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-green-900  text-white overflow-hidden px-4">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-green-600/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-700/20 text-white-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Real Estate Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            Find Your Dream Home with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-indigo-100">
              Real State
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Browse verified listings across India, schedule in-person viewing
            appointments directly with owners, or list your property in minutes.
          </p>

          {/* SEARCH BOX */}
          <div className="mt-10 max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-4 sm:p-5 text-slate-800 border border-slate-100">
            {/* Sale / Rent Switcher */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setListingType("sale")}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  listingType === "sale"
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Buy Property
              </button>
              <button
                type="button"
                onClick={() => setListingType("rent")}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  listingType === "rent"
                    ? "bg-green-800 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Rent Property
              </button>
            </div>

            {/* Form inputs */}
            <form
              onSubmit={handleSearch}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              {/* City Input */}
              <div className="sm:col-span-6 flex items-center gap-2.5 px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-green-500 focus-within:bg-white transition">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter City, Locality (e.g. Mumbai, Whitefield)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs text-slate-800 font-medium placeholder:text-slate-400"
                />
              </div>

              {/* Property Type Dropdown */}
              <div className="sm:col-span-3 flex items-center gap-2 px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-green-500 focus-within:bg-white transition">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs text-slate-800 font-medium cursor-pointer"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full h-11 rounded-2xl bg-green-600 hover:bg-green-400 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </form>

            {/* Popular Cities */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Popular:</span>
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCityClick(c)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CORE HIGHLIGHTS / VALUE PROPOSITION */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Why Choose  RealEstate?
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">
            Built with modern architecture for seamless browsing, booking, and listing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Verified Properties
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every listing comes with detailed specifications, possession status,
              and up to 4 high-resolution photos hosted on an ultra-fast CDN.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Viewing Appointments
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Schedule in-person visits seamlessly as a guest or logged-in user.
              Choose between morning or afternoon slots with automated tracking.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              AI Smart Search
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Find user-uploaded properties matching your exact location, budget,
              and desired amenities with intelligent AI ranking.
            </p>
          </div>
        </div>
      </section>

      {/* CTA SECTION FOR SELLERS / OWNERS */}
      <section className="px-6 pb-20 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-r from-green-800 to-green-300 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl space-y-3">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold uppercase tracking-wider">
              For Property Owners
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to sell or rent your property?
            </h3>
            <p className="text-green-100 text-xs sm:text-sm leading-relaxed">
              List your apartment, villa, plot, or commercial space in minutes.
              Manage viewing requests and inquiries directly in your dashboard.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/properties/new"
              className="px-6 py-3 rounded-2xl bg-white text-slate-700 font-bold text-xs hover:bg-green-50 transition shadow-lg flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Post Property Free
            </Link>
            <Link
              href="/properties"
              className="px-6 py-3 rounded-2xl bg-green-800 hover:bg-green-600 text-white font-bold text-xs border border-white/20 transition flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
