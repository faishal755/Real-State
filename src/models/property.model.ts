import mongoose, { Schema, Document, Model, Types } from 'mongoose';

    export interface IProperty extends Document {
      title: string;
      description: string;
      propertyType: 'apartment' | 'villa' | 'plot' | 'commercial';
      listingType: 'sale' | 'rent';
      bhk: number;
      bathrooms: number;
      price: number; // Stored as raw number in INR (e.g. 7500000 for 75 Lac)
      areaSqFt: number;
      city: string;
      locality: string;
      address: string;
      possessionStatus: 'ready' | 'under_construction';
      furnishing: 'unfurnished' | 'semi' | 'furnished';
      amenities: string[];
      images: string[]; // ImageKit URLs (max 4 per PDF specification)
      owner: Types.ObjectId;
      isFeatured?: boolean;
      createdAt: Date;
      updatedAt: Date;
    }

    const PropertySchema: Schema<IProperty> = new Schema(
      {
        title: { type: String, required: [true, 'Title is required'], trim: true },
        description: { type: String, required: [true, 'Description is required'] },
        propertyType: {
          type: String,
          enum: ['apartment', 'villa', 'plot', 'commercial'],
          default: 'apartment',
          required: true,
        },
        listingType: {
          type: String,
          enum: ['sale', 'rent'],
          default: 'sale',
          required: true,
        },
        bhk: { type: Number, required: true, min: 0, max: 10 },
        bathrooms: { type: Number, required: true, default: 1 },
        price: { type: Number, required: [true, 'Price is required'], min: 0 },
        areaSqFt: { type: Number, required: [true, 'Area in Sq.Ft is required'], min: 0 },
        city: { type: String, required: [true, 'City is required'], trim: true },
        locality: { type: String, required: [true, 'Locality is required'], trim: true },
        address: { type: String, required: [true, 'Address is required'] },
        possessionStatus: {
          type: String,
          enum: ['ready', 'under_construction'],
          default: 'ready',
        },
        furnishing: {
          type: String,
          enum: ['unfurnished', 'semi', 'furnished'],
          default: 'semi',
        },
        amenities: { type: [String], default: [] },
        images: {
          type: [String],
          validate: [
            (val: string[]) => val.length <= 4,
            'Cannot exceed 4 images per property specification',
          ],
          default: [],
        },
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        isFeatured: { type: Boolean, default: false },
      },
      { timestamps: true }
    );

    // Indexes for fast 99acres-style filtering
    PropertySchema.index({ city: 1, locality: 1, price: 1 });
    PropertySchema.index({ propertyType: 1, bhk: 1 });      

    const Property: Model<IProperty> =
      mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);
    export default Property;
  
    