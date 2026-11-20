import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Appointment from "@/models/appointment.model";
import Property from "@/models/property.model";
import { NextRequest, NextResponse } from "next/server";

// GET /api/appointments - Fetch user's booked appointments or received inquiries
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in to view appointments." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "my"; // "my" or "received"

    await connectDb();

    if (type === "received") {
      // Find properties owned by this user first
      const userProperties = await Property.find({ owner: session.user.id }).select("_id");
      const propertyIds = userProperties.map((p) => p._id);

      // Find all appointments for these properties
      const appointments = await Appointment.find({ property: { $in: propertyIds } })
        .populate("property", "title city locality price images listingType propertyType")
        .populate("user", "name email mobileNumber")
        .sort({ visitDate: 1, createdAt: -1 })
        .lean();

      return NextResponse.json({ appointments }, { status: 200 });
    }

    // Default: "my" booked appointments
    const appointments = await Appointment.find({ user: session.user.id })
      .populate("property", "title city locality price images listingType propertyType owner")
      .sort({ visitDate: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error fetching appointments: ${error.message || error}` },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Book Viewing (Supports both Authenticated Users & Guests per PDF Spec)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { propertyId, guestName, guestEmail, guestPhone, phone, visitDate, timeSlot, notes } = body;

    if (!propertyId || !visitDate || !timeSlot) {
      return NextResponse.json(
        { message: "Property ID, visit date, and time slot are required." },
        { status: 400 }
      );
    }

    // Determine identity: Logged in or Guest
    const isAuth = Boolean(session?.user?.id);
    const effectiveName = isAuth ? (session?.user?.name || "Logged-in User") : guestName?.trim();
    const effectiveEmail = isAuth ? session?.user?.email?.toLowerCase() : guestEmail?.trim()?.toLowerCase();
    const effectivePhone = phone?.trim() || guestPhone?.trim();

    if (!isAuth && (!effectiveName || !effectiveEmail || !effectivePhone)) {
      return NextResponse.json(
        { message: "Please provide your full name, email, and phone number to schedule a viewing." },
        { status: 400 }
      );
    }

    // Time slot validation per PDF model
    const validSlots = ["10:00 AM - 01:00 PM", "02:00 PM - 06:00 PM"];
    if (!validSlots.includes(timeSlot)) {
      return NextResponse.json(
        { message: "Invalid time slot. Please choose '10:00 AM - 01:00 PM' or '02:00 PM - 06:00 PM'." },
        { status: 400 }
      );
    }

    await connectDb();

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json(
        { message: "Property not found." },
        { status: 404 }
      );
    }

    // Prevent owners from booking viewings for their own properties
    if (isAuth && property.owner.toString() === session?.user?.id) {
      return NextResponse.json(
        { message: "You cannot schedule a viewing appointment for your own listing." },
        { status: 400 }
      );
    }

    const appointment = await Appointment.create({
      property: propertyId,
      user: isAuth ? session?.user?.id : undefined,
      guestName: effectiveName,
      guestEmail: effectiveEmail,
      guestPhone: effectivePhone,
      visitDate: new Date(visitDate),
      timeSlot,
      status: "pending",
      notes: notes?.trim(),
    });

    return NextResponse.json(
      {
        message: "Viewing appointment scheduled successfully! The property owner has been notified.",
        appointment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: `Failed to book appointment: ${error.message || error}` },
      { status: 500 }
    );
  }
}
