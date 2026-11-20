import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Property from "@/models/property.model";

export interface AISearchResult {
  _id: string;
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  bhk: number;
  bathrooms: number;
  price: number;
  areaSqFt: number;
  city: string;
  locality: string;
  address: string;
  possessionStatus: string;
  furnishing: string;
  amenities: string[];
  images: string[];
  owner?: {
    name?: string;
    email?: string;
    mobileNumber?: string;
  };
  matchScore: number; // 0 - 100
  aiHighlights: string[];
}

/**
 * Natural Language Processing (NLP) intent parser:
 * Extracts location, budget, BHK, property type, furnishing, and amenities from natural text.
 */
function parseNaturalQuery(text: string) {
  const query = text.toLowerCase().trim();

  // 1. Extract BHK (e.g., "3 bhk", "2 bedrooms", "1 bed")
  let bhk: number | null = null;
  const bhkMatch = query.match(/(\d+)\s*(?:bhk|bed|bedroom|br)\b/i);
  if (bhkMatch) {
    bhk = parseInt(bhkMatch[1], 10);
  }

  // 2. Extract Budget / Price
  let maxPrice: number | null = null;
  // Crores match: "under 2 cr", "below 1.5 crore", "budget 2.2 crores"
  const crMatch = query.match(/(?:under|below|budget|max|upto|within|around|<)?\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:crore|crores|cr)\b/i);
  // Lakhs match: "under 80 lakhs", "50 lac", "upto 90 lacs", "60 l"
  const lakhMatch = query.match(/(?:under|below|budget|max|upto|within|around|<)?\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b/i);
  // Thousands match: "under 40k", "25 thousand" (for rentals)
  const kMatch = query.match(/(?:under|below|budget|max|upto|within|around|<)?\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:k|thousand)\b/i);

  if (crMatch) {
    maxPrice = Math.round(parseFloat(crMatch[1]) * 10000000);
  } else if (lakhMatch) {
    maxPrice = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else if (kMatch) {
    maxPrice = Math.round(parseFloat(kMatch[1]) * 1000);
  }

  // 3. Extract City
  const knownCities = [
    "mumbai",
    "pune",
    "bengaluru",
    "bangalore",
    "delhi",
    "noida",
    "gurgaon",
    "gurugram",
    "hyderabad",
    "chennai",
    "kolkata",
    "ahmedabad",
    "goa",
    "thane",
    "navi mumbai",
    "jaipur",
    "lucknow",
    "chandigarh",
  ];
  let city: string | null = null;
  for (const c of knownCities) {
    if (new RegExp(`\\b${c}\\b`, "i").test(query)) {
      city = c === "bangalore" ? "Bengaluru" : c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  // 4. Extract Property Type
  let propertyType: string | null = null;
  if (/\b(?:villa|bungalow|independent house)\b/i.test(query)) {
    propertyType = "villa";
  } else if (/\b(?:flat|apartment|penthouse|condo)\b/i.test(query)) {
    propertyType = "apartment";
  } else if (/\b(?:plot|land)\b/i.test(query)) {
    propertyType = "plot";
  } else if (/\b(?:commercial|office|shop|retail)\b/i.test(query)) {
    propertyType = "commercial";
  }

  // 5. Extract Listing Type (Rent vs Sale)
  let listingType: string | null = null;
  if (/\b(?:rent|rental|lease|to rent)\b/i.test(query)) {
    listingType = "rent";
  } else if (/\b(?:buy|sale|purchase|for sale)\b/i.test(query)) {
    listingType = "sale";
  }

  // 6. Extract Furnishing
  let furnishing: string | null = null;
  if (/\b(?:fully furnished|furnished)\b/i.test(query)) {
    furnishing = "furnished";
  } else if (/\b(?:semi furnished|semi-furnished)\b/i.test(query)) {
    furnishing = "semi";
  } else if (/\b(?:unfurnished|bare)\b/i.test(query)) {
    furnishing = "unfurnished";
  }

  // 7. Extract Specialities & Amenities
  const requestedAmenities: string[] = [];
  const amenityKeywords: Record<string, string[]> = {
    "Swimming Pool": ["pool", "swimming pool", "swimming"],
    Gymnasium: ["gym", "gymnasium", "fitness center", "health club"],
    "Covered Parking": ["parking", "covered parking", "garage", "car park"],
    "24/7 Security": ["security", "guard", "cctv", "gated"],
    "Power Backup": ["power backup", "backup generator", "generator"],
    "Club House": ["clubhouse", "club house"],
    "Garden / Park": ["garden", "park", "lawn", "green space"],
    "Sea Facing": ["sea facing", "sea view", "sea-facing", "ocean view"],
    "Balcony / Terrace": ["balcony", "terrace", "deck"],
    "Kids Play Area": ["kids play area", "play area", "children park"],
    "Ready Possession": ["ready to move", "ready possession", "immediate possession", "ready"],
  };

  for (const [canonicalName, synonyms] of Object.entries(amenityKeywords)) {
    for (const syn of synonyms) {
      if (new RegExp(`\\b${syn}\\b`, "i").test(query)) {
        requestedAmenities.push(canonicalName);
        break;
      }
    }
  }

  return {
    city,
    bhk,
    maxPrice,
    propertyType,
    listingType,
    furnishing,
    requestedAmenities,
  };
}

// POST /api/ai-hub/search - Intelligent AI-Powered Property Search on User-Uploaded Properties
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      query = "",
      city: explicitCity,
      bhk: explicitBhk,
      maxPrice: explicitMaxPrice,
      minPrice: explicitMinPrice,
      propertyType: explicitPropertyType,
      listingType: explicitListingType,
      furnishing: explicitFurnishing,
      amenities: explicitAmenities = [],
    } = body;

    await connectDb();

    // 1. NLP Parse query string
    const parsed = parseNaturalQuery(query);

    // Merge explicit filters (from dropdowns) with parsed NLP entities
    const finalCity = (explicitCity && explicitCity !== "all" ? explicitCity : parsed.city) || null;
    const finalBhk = explicitBhk && Number(explicitBhk) > 0 ? Number(explicitBhk) : parsed.bhk;
    const finalMaxPrice = explicitMaxPrice && Number(explicitMaxPrice) > 0 ? Number(explicitMaxPrice) : parsed.maxPrice;
    const finalMinPrice = explicitMinPrice && Number(explicitMinPrice) > 0 ? Number(explicitMinPrice) : null;
    const finalPropertyType = (explicitPropertyType && explicitPropertyType !== "all" ? explicitPropertyType : parsed.propertyType) || null;
    const finalListingType = (explicitListingType && explicitListingType !== "all" ? explicitListingType : parsed.listingType) || null;
    const finalFurnishing = (explicitFurnishing && explicitFurnishing !== "all" ? explicitFurnishing : parsed.furnishing) || null;

    // Combine requested amenities
    const requestedAmenitiesSet = new Set<string>([
      ...parsed.requestedAmenities,
      ...(Array.isArray(explicitAmenities) ? explicitAmenities : [explicitAmenities].filter(Boolean)),
    ]);

    // 2. Fetch all user-uploaded properties from database
    const dbProperties = await Property.find({})
      .populate("owner", "name email mobileNumber")
      .sort({ createdAt: -1 })
      .lean();

    if (!dbProperties || dbProperties.length === 0) {
      return NextResponse.json({
        success: true,
        query,
        resultsCount: 0,
        parsedIntent: {
          city: finalCity,
          bhk: finalBhk,
          maxPrice: finalMaxPrice,
          propertyType: finalPropertyType,
          listingType: finalListingType,
          furnishing: finalFurnishing,
          amenities: Array.from(requestedAmenitiesSet),
        },
        rankedResults: [],
      });
    }

    // 3. AI Relevance & Matching Engine
    const searchTerms = (query || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((term: string) => term.length > 2 && !["the", "and", "for", "with", "near", "under"].includes(term));

    const ranked: AISearchResult[] = [];

    for (const prop of dbProperties as any[]) {
      let score = 55; // Baseline score
      const highlights: string[] = [];

      // A. Location Matching (City & Locality)
      if (finalCity) {
        const propCity = (prop.city || "").toLowerCase();
        const targetCity = finalCity.toLowerCase();

        if (propCity.includes(targetCity) || targetCity.includes(propCity)) {
          score += 22;
          highlights.push(`Located in your preferred city: ${prop.city}`);
        } else {
          // Significant penalty if location was explicitly targeted and does not match
          score -= 35;
        }
      }

      // Check locality keyword relevance
      const fullLocality = `${prop.locality || ""} ${prop.address || ""}`.toLowerCase();
      let localityMatched = false;
      searchTerms.forEach((term: string) => {
        if (fullLocality.includes(term) && !localityMatched) {
          localityMatched = true;
          score += 8;
          highlights.push(`Matches locality: ${prop.locality}`);
        }
      });

      // B. BHK Matching
      if (finalBhk) {
        if (prop.bhk === finalBhk) {
          score += 20;
          highlights.push(`Exact ${finalBhk} BHK configuration match`);
        } else if (Math.abs(prop.bhk - finalBhk) === 1) {
          score += 5;
          highlights.push(`Close layout option (${prop.bhk} BHK instead of ${finalBhk} BHK)`);
        } else {
          score -= 15;
        }
      }

      // C. Price / Budget Matching
      if (finalMaxPrice) {
        if (prop.price <= finalMaxPrice) {
          const savings = finalMaxPrice - prop.price;
          const savingsPercent = Math.round((savings / finalMaxPrice) * 100);
          score += 18;

          if (savingsPercent >= 10) {
            highlights.push(`Great value: ~${savingsPercent}% under your maximum budget`);
          } else {
            highlights.push("Well within your targeted price range");
          }
        } else {
          const excessPercent = Math.round(((prop.price - finalMaxPrice) / finalMaxPrice) * 100);
          if (excessPercent <= 15) {
            score -= 5;
            highlights.push(`Slightly above budget (+${excessPercent}%)`);
          } else {
            score -= 25;
          }
        }
      }

      if (finalMinPrice && prop.price < finalMinPrice) {
        score -= 10;
      }

      // D. Property Type Matching (Apartment, Villa, Plot, Commercial)
      if (finalPropertyType) {
        if (prop.propertyType?.toLowerCase() === finalPropertyType.toLowerCase()) {
          score += 15;
          highlights.push(`Matches requested ${prop.propertyType} category`);
        } else {
          score -= 15;
        }
      }

      // E. Listing Type Matching (Sale vs Rent)
      if (finalListingType) {
        if (prop.listingType?.toLowerCase() === finalListingType.toLowerCase()) {
          score += 10;
          highlights.push(`Available for ${prop.listingType}`);
        } else {
          score -= 20;
        }
      }

      // F. Furnishing Matching
      if (finalFurnishing) {
        if (prop.furnishing?.toLowerCase() === finalFurnishing.toLowerCase()) {
          score += 8;
          highlights.push(`${prop.furnishing.charAt(0).toUpperCase() + prop.furnishing.slice(1)} interior`);
        }
      }

      // G. Specialities & Amenities Matching
      const propAmenities = Array.isArray(prop.amenities) ? prop.amenities : [];
      const matchedAmenities: string[] = [];

      requestedAmenitiesSet.forEach((reqAmenity) => {
        const reqLower = reqAmenity.toLowerCase();
        const found = propAmenities.some((pa: string) => pa.toLowerCase().includes(reqLower) || reqLower.includes(pa.toLowerCase())) ||
          prop.description?.toLowerCase().includes(reqLower) ||
          prop.title?.toLowerCase().includes(reqLower);

        if (found) {
          matchedAmenities.push(reqAmenity);
        }
      });

      if (matchedAmenities.length > 0) {
        score += Math.min(20, matchedAmenities.length * 7);
        highlights.push(`Features requested: ${matchedAmenities.slice(0, 3).join(", ")}`);
      }

      // H. Text / Description Semantic Relevance
      const fullText = `${prop.title} ${prop.description} ${prop.address}`.toLowerCase();
      let matchedTermCount = 0;
      searchTerms.forEach((term: string) => {
        if (fullText.includes(term)) {
          matchedTermCount++;
        }
      });
      if (matchedTermCount > 0) {
        score += Math.min(10, matchedTermCount * 3);
      }

      // I. User-Uploaded Trust Factor
      if (prop.owner?.name) {
        highlights.push(`Directly listed by user: ${prop.owner.name}`);
      }

      // If city was specified and property is in a completely different city, drop if score is too low
      if (finalCity && score < 45) {
        continue;
      }

      // Clamp match score between 40% and 99%
      const finalScore = Math.max(42, Math.min(99, score));

      ranked.push({
        _id: prop._id.toString(),
        title: prop.title,
        description: prop.description,
        propertyType: prop.propertyType,
        listingType: prop.listingType,
        bhk: prop.bhk,
        bathrooms: prop.bathrooms,
        price: prop.price,
        areaSqFt: prop.areaSqFt,
        city: prop.city,
        locality: prop.locality,
        address: prop.address,
        possessionStatus: prop.possessionStatus,
        furnishing: prop.furnishing,
        amenities: prop.amenities || [],
        images: prop.images || [],
        owner: prop.owner ? {
          name: prop.owner.name,
          email: prop.owner.email,
          mobileNumber: prop.owner.mobileNumber,
        } : undefined,
        matchScore: finalScore,
        aiHighlights: highlights.slice(0, 4),
      });
    }

    // Sort descending by AI match score
    ranked.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      query,
      resultsCount: ranked.length,
      parsedIntent: {
        city: finalCity,
        bhk: finalBhk,
        maxPrice: finalMaxPrice,
        propertyType: finalPropertyType,
        listingType: finalListingType,
        furnishing: finalFurnishing,
        amenities: Array.from(requestedAmenitiesSet),
      },
      rankedResults: ranked,
    });
  } catch (error: any) {
    console.error("AI Search Error:", error);
    return NextResponse.json(
      { message: `AI Search failed: ${error.message || error}` },
      { status: 500 }
    );
  }
}
