import mongoose, { Document } from "mongoose";



export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role:"admin"|"user"
  isEmailVerified?: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  mobileNumber?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  createdAt: Date;
  updatedAt: Date;
}
const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user",  "admin"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    
    mobileNumber: {
      type: String,
    },
  
    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
   
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: [Number],
    },
    
  },
  { timestamps: true },
);

userSchema.index({ location: "2dsphere" });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;