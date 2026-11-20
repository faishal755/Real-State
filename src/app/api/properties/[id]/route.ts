import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Property from "@/models/property.model";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/properties/[id] - Fetch single property
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDb();

    const property = await Property.findById(id).populate(
      "owner",
      "name email mobileNumber"
    );

    if (!property) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ property }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error fetching property: ${error.message || error}` },
      { status: 500 }
    );
  }
}

// PUT /api/properties/[id] - Update property (Ownership check)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in to update this property." },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDb();

    const existingProperty = await Property.findById(id);
    if (!existingProperty) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 }
      );
    }

    // Ownership Enforcement (PDF Exercise Requirement)
    const isOwner = existingProperty.owner.toString() === session.user.id;
    const isAdmin = (session.user as any).role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: "Forbidden: You do not have permission to edit this property." },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Enforce max 4 images
    if (body.images && Array.isArray(body.images) && body.images.length > 4) {
      return NextResponse.json(
        { message: "Cannot exceed 4 images per property specification." },
        { status: 400 }
      );
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      {
        $set: {
          title: body.title !== undefined ? body.title : existingProperty.title,
          description: body.description !== undefined ? body.description : existingProperty.description,
          propertyType: body.propertyType || existingProperty.propertyType,
          listingType: body.listingType || existingProperty.listingType,
          bhk: body.bhk !== undefined ? Number(body.bhk) : existingProperty.bhk,
          bathrooms: body.bathrooms !== undefined ? Number(body.bathrooms) : existingProperty.bathrooms,
          price: body.price !== undefined ? Number(body.price) : existingProperty.price,
          areaSqFt: body.areaSqFt !== undefined ? Number(body.areaSqFt) : existingProperty.areaSqFt,
          city: body.city || existingProperty.city,
          locality: body.locality || existingProperty.locality,
          address: body.address || existingProperty.address,
          possessionStatus: body.possessionStatus || existingProperty.possessionStatus,
          furnishing: body.furnishing || existingProperty.furnishing,
          amenities: body.amenities || existingProperty.amenities,
          images: body.images || existingProperty.images,
          isFeatured: body.isFeatured !== undefined ? body.isFeatured : existingProperty.isFeatured,
        },
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { message: "Property updated successfully", property: updatedProperty },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: `Failed to update property: ${error.message || error}` },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id] - Delete property (Ownership check)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in to delete this property." },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDb();

    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 }
      );
    }

    // Ownership Enforcement
    const isOwner = property.owner.toString() === session.user.id;
    const isAdmin = (session.user as any).role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: "Forbidden: You do not have permission to delete this property." },
        { status: 403 }
      );
    }

    await Property.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Property deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: `Failed to delete property: ${error.message || error}` },
      { status: 500 }
    );
  }
}
