import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Property from "@/models/property.model";
import { NextRequest, NextResponse } from "next/server";

// GET /api/properties - Search & Filter Properties
export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);

    const query: any = {};

    // 1. City & Locality filters (Case-insensitive)
    const city = searchParams.get("city");
    if (city && city.trim()) {
      query.city = { $regex: new RegExp(city.trim(), "i") };
    }

    const locality = searchParams.get("locality");
    if (locality && locality.trim()) {
      query.locality = { $regex: new RegExp(locality.trim(), "i") };
    }

    // 2. Property Type (apartment, villa, plot, commercial)
    const propertyType = searchParams.get("propertyType");
    if (propertyType && propertyType.trim()) {
      query.propertyType = propertyType.trim();
    }

    // 3. Listing Type (sale, rent)
    const listingType = searchParams.get("listingType");
    if (listingType && listingType.trim()) {
      query.listingType = listingType.trim();
    }

    // 4. BHK Filter (e.g. 1, 2, 3, 4+)
    const bhk = searchParams.get("bhk");
    if (bhk) {
      const bhkNum = parseInt(bhk);
      if (!isNaN(bhkNum)) {
        if (bhkNum >= 4) {
          query.bhk = { $gte: 4 };
        } else {
          query.bhk = bhkNum;
        }
      }
    }

    // 5. Price Range
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !isNaN(Number(minPrice))) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // 6. Furnishing Status
    const furnishing = searchParams.get("furnishing");
    if (furnishing) {
      query.furnishing = furnishing;
    }

    // 7. Possession Status
    const possessionStatus = searchParams.get("possessionStatus");
    if (possessionStatus) {
      query.possessionStatus = possessionStatus;
    }

    // 8. Filter by Owner (for User Dashboard)
    const ownerId = searchParams.get("owner");
    if (ownerId) {
      query.owner = ownerId;
    }

    // 9. Full Text Search
    const search = searchParams.get("search");
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: regex },
        { description: regex },
        { city: regex },
        { locality: regex },
        { address: regex },
      ];
    }

    // Sorting
    const sort = searchParams.get("sort") || "newest";
    let sortOption: any = { createdAt: -1 };
    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    }

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "12")));
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate("owner", "name email mobileNumber")
        .lean(),
      Property.countDocuments(query),
    ]);

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error fetching properties: ${error.message || error}` },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create Property (Authenticated)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in to post a property." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      propertyType,
      listingType,
      bhk,
      bathrooms,
      price,
      areaSqFt,
      city,
      locality,
      address,
      possessionStatus,
      furnishing,
      amenities,
      images,
      isFeatured,
    } = body;

    // Validate Required Fields
    if (
      !title ||
      !description ||
      !propertyType ||
      !listingType ||
      bhk === undefined ||
      !price ||
      !areaSqFt ||
      !city ||
      !locality ||
      !address
    ) {
      return NextResponse.json(
        { message: "Please fill in all required property details." },
        { status: 400 }
      );
    }

    // Validate images max 4 (PDF specification)
    const propertyImages = Array.isArray(images) ? images : [];
    if (propertyImages.length > 4) {
      return NextResponse.json(
        { message: "A property cannot have more than 4 images." },
        { status: 400 }
      );
    }

    await connectDb();

    const newProperty = await Property.create({
      title: title.trim(),
      description: description.trim(),
      propertyType,
      listingType,
      bhk: Number(bhk),
      bathrooms: Number(bathrooms || 1),
      price: Number(price),
      areaSqFt: Number(areaSqFt),
      city: city.trim(),
      locality: locality.trim(),
      address: address.trim(),
      possessionStatus: possessionStatus || "ready",
      furnishing: furnishing || "semi",
      amenities: Array.isArray(amenities) ? amenities : [],
      images: propertyImages,
      owner: session.user.id,
      isFeatured: Boolean(isFeatured),
    });

    return NextResponse.json(
      { message: "Property listed successfully!", property: newProperty },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: `Failed to create property: ${error.message || error}` },
      { status: 500 }
    );
  }
}
