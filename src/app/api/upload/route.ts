import { auth } from "@/auth";
import { uploadImageToCDN } from "@/lib/imagekit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in to upload images." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "No images provided" },
        { status: 400 }
      );
    }

    // PDF Specification: Maximum 4 images per property
    if (files.length > 4) {
      return NextResponse.json(
        { message: "You can upload a maximum of 4 images per property." },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { message: `Invalid file type: ${file.name}. Only images are allowed.` },
          { status: 400 }
        );
      }

      // 5MB per image limit
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: `File ${file.name} exceeds 5MB limit.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const url = await uploadImageToCDN(buffer, file.name);
      uploadedUrls.push(url);
    }

    return NextResponse.json(
      { message: "Images uploaded successfully", urls: uploadedUrls },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: `Failed to upload images: ${error.message || error}` },
      { status: 500 }
    );
  }
}
