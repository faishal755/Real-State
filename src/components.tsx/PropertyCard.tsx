"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Bath, BedDouble, Camera, MapPin, Maximize2, Sparkles } from "lucide-react";
import { formatINR } from "@/lib/formatPrice";

export interface PropertyCardProps {
  property: {
    _id: string;
    title: string;
    description?: string;
    propertyType: "apartment" | "villa" | "plot" | "commercial";
    listingType: "sale" | "rent";
    bhk: number;
    bathrooms: number;
    price: number;
    areaSqFt: number;
    city: string;
    locality: string;
    address?: string;
    furnishing?: string;
    possessionStatus?: string;
    images?: string[];
    isFeatured?: boolean;
    createdAt?: string;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const coverImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

  const imageCount = property.images?.length || 0;

  return (
    <div className="group rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Property Image & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider text-white shadow-sm ${
              property.listingType === "sale" ? "bg-green-600" : "bg-emerald-600"
            }`}
          >
            {property.listingType === "sale" ? "For Sale" : "For Rent"}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize bg-slate-900/80 backdrop-blur-md text-white">
            {property.propertyType}
          </span>
          {property.isFeatured && (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>

        {/* Photo Count */}
        {imageCount > 0 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5">
            <Camera className="w-3 h-3" />
            <span>{imageCount} photos</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between ">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatINR(property.price, property.listingType)}
            </h3>
            {property.furnishing && (
              <span className="text-[11px] uppercase font-bold text-slate-400">
                {property.furnishing}
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/properties/${property._id}`}>
            <h4 className="text-sm font-bold text-slate-800 group-hover:text-green-600 transition line-clamp-1">
              {property.title}
            </h4>
          </Link>

          {/* Location */}
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {property.locality}, {property.city}
            </span>
          </p>
        </div>

        {/* Specs Row */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          {property.bhk > 0 && (
            <div className="flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-green-500" />
              <span>{property.bhk} BHK</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-indigo-500" />
            <span>{property.bathrooms} Bath</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-emerald-500" />
            <span>{property.areaSqFt.toLocaleString("en-IN")} sq.ft</span>
          </div>
        </div>

        {/* View Details CTA */}
        <Link
          href={`/properties/${property._id}`}
          className="mt-4 w-full py-2.5 rounded-xl bg-slate-50 hover:bg-green-600 hover:text-white text-slate-700 text-xs font-bold text-center border border-slate-200 hover:border-transparent transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
