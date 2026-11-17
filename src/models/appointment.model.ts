import mongoose, { Schema, Document, Model, Types } from 'mongoose';

    export interface IAppointment extends Document {
      property: Types.ObjectId;
      user?: Types.ObjectId; // Optional: set if user is logged in
      guestName?: string;     // Required if user is guest
      guestEmail?: string;
      guestPhone?: string;    // 10-digit mobile number
      visitDate: Date;
      timeSlot: string;       // e.g. "10:00 AM - 01:00 PM" or "02:00 PM - 06:00 PM"
      status: 'pending' | 'confirmed' | 'cancelled';
      notes?: string;
      createdAt: Date;
      updatedAt: Date;
    }

    const AppointmentSchema: Schema<IAppointment> = new Schema(
      {
        property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        guestName: { type: String, trim: true },
        guestEmail: { type: String, trim: true, lowercase: true },
        guestPhone: { type: String, trim: true },
        visitDate: { type: Date, required: [true, 'Visit date is required'] },
        timeSlot: {
          type: String,
          required: [true, 'Time slot is required'],
          enum: ['10:00 AM - 01:00 PM', '02:00 PM - 06:00 PM'],
        },
        status: {
          type: String,
          enum: ['pending', 'confirmed', 'cancelled'],
          default: 'pending',
        },
        notes: { type: String, trim: true },
      },
      { timestamps: true }
    );

    const Appointment: Model<IAppointment> =
      mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
    export default Appointment;