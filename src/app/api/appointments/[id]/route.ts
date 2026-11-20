import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Appointment from "@/models/appointment.model";
import Property from "@/models/property.model";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/appointments/[id] - Update status (confirm or cancel)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value." },
        { status: 400 }
      );
    }

    await connectDb();

    const appointment = await Appointment.findById(id).populate("property");
    if (!appointment) {
      return NextResponse.json(
        { message: "Appointment not found." },
        { status: 404 }
      );
    }

    const isBooker = appointment.user?.toString() === session.user.id;
    const propertyOwnerId = (appointment.property as any)?.owner?.toString();
    const isOwner = propertyOwnerId === session.user.id;
    const isAdmin = (session.user as any).role === "admin";

    // Permission rules:
    // - Booker can only cancel ("cancelled")
    // - Owner or Admin can confirm or cancel
    if (!isBooker && !isOwner && !isAdmin) {
      return NextResponse.json(
        { message: "Forbidden: You do not have permission to manage this appointment." },
        { status: 403 }
      );
    }

    if (isBooker && !isOwner && !isAdmin && status !== "cancelled") {
      return NextResponse.json(
        { message: "Visitors can only cancel their appointments." },
        { status: 403 }
      );
    }

    appointment.status = status;
    await appointment.save();

    return NextResponse.json(
      { message: `Appointment ${status} successfully.`, appointment },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: `Failed to update appointment: ${error.message || error}` },
      { status: 500 }
    );
  }
}

// GET /api/appointments/[id] - Fetch single appointment
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDb();

    const appointment = await Appointment.findById(id)
      .populate("property")
      .populate("user", "name email mobileNumber");

    if (!appointment) {
      return NextResponse.json(
        { message: "Appointment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error fetching appointment: ${error.message || error}` },
      { status: 500 }
    );
  }
}
