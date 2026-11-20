const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// MongoDB Replica Set Connection String
const uri =
  process.env.MONGODB_URI ||
  "mongodb://db_username:wri5l8HMLxRZmpQc@ac-sc6iubf-shard-00-00.ltgchiu.mongodb.net:27017,ac-sc6iubf-shard-00-01.ltgchiu.mongodb.net:27017,ac-sc6iubf-shard-00-02.ltgchiu.mongodb.net:27017/real-state?ssl=true&replicaSet=atlas-a5jux1-shard-0&authSource=admin";

async function seed() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("Connected successfully!");

  const db = mongoose.connection.db;

  const usersCollection = db.collection("users");
  const propertiesCollection = db.collection("properties");
  const appointmentsCollection = db.collection("appointments");

  // Faishal Sheikh (existing user)
  let faishalUser = await usersCollection.findOne({ email: "faishalsheikh0@gmail.com" });
  if (faishalUser) {
    await usersCollection.updateOne(
      { _id: faishalUser._id },
      { $set: { mobileNumber: "9876543210", isEmailVerified: true } }
    );
    console.log("Updated Faishal Sheikh profile.");
  }

  // Demo Seller 1: Rohit Deshmukh
  let seller1 = await usersCollection.findOne({ email: "rohit.realty@sapphireiq.com" });
  if (!seller1) {
    const passwordHash = await bcrypt.hash("Password123!", 10);
    const res = await usersCollection.insertOne({
      name: "Rohit Deshmukh",
      email: "rohit.realty@sapphireiq.com",
      password: passwordHash,
      mobileNumber: "9820012345",
      role: "user",
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    seller1 = { _id: res.insertedId };
    console.log("Created demo seller Rohit Deshmukh.");
  }

  // Demo Seller 2: Priya Sharma
  let seller2 = await usersCollection.findOne({ email: "priya.sharma@sapphireiq.com" });
  if (!seller2) {
    const passwordHash = await bcrypt.hash("Password123!", 10);
    const res = await usersCollection.insertOne({
      name: "Priya Sharma",
      email: "priya.sharma@sapphireiq.com",
      password: passwordHash,
      mobileNumber: "9819922334",
      role: "user",
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    seller2 = { _id: res.insertedId };
    console.log("Created demo seller Priya Sharma.");
  }

  // Demo Seller 3: Vikram Malhotra
  let seller3 = await usersCollection.findOne({ email: "vikram.malhotra@sapphireiq.com" });
  if (!seller3) {
    const passwordHash = await bcrypt.hash("Password123!", 10);
    const res = await usersCollection.insertOne({
      name: "Vikram Malhotra",
      email: "vikram.malhotra@sapphireiq.com",
      password: passwordHash,
      mobileNumber: "9845012345",
      role: "user",
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    seller3 = { _id: res.insertedId };
    console.log("Created demo seller Vikram Malhotra.");
  }

  const faishalId = faishalUser ? faishalUser._id : seller1._id;
  const seller1Id = seller1._id;
  const seller2Id = seller2._id;
  const seller3Id = seller3._id;

  // Clear existing properties and appointments for clean seed
  console.log("Cleaning old properties and appointments...");
  await propertiesCollection.deleteMany({});
  await appointmentsCollection.deleteMany({});

  const properties = [
    {
      title: "Sea-Facing 3 BHK Luxury Penthouse in Worli",
      description:
        "Spectacular panoramic Arabian Sea views from the 24th floor. Features imported Italian marble flooring, floor-to-ceiling soundproof glass facades, designer modular kitchen with German fittings, and 2 dedicated basement parking slots. Located within 5 minutes of the Bandra-Worli Sea Link.",
      propertyType: "apartment",
      listingType: "sale",
      bhk: 3,
      bathrooms: 3,
      price: 42500000, // 4.25 Cr
      areaSqFt: 1850,
      city: "Mumbai",
      locality: "Worli Sea Face",
      address: "Tower A, Lodha The Park, Worli Sea Face, Mumbai",
      possessionStatus: "ready",
      furnishing: "furnished",
      amenities: [
        "24/7 Security",
        "Covered Parking",
        "Power Backup",
        "Gymnasium",
        "Swimming Pool",
        "Clubhouse",
        "High Speed Elevators",
        "Sea View",
      ],
      images: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: faishalId,
      isFeatured: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "Sunlit 2 BHK Modern Flat in Whitefield",
      description:
        "Sunlit East-facing apartment surrounded by lush manicured greenery. Situated right in the heart of Bengaluru's tech corridor, just 10 minutes from ITPL, Columbia Asia Hospital, and the Purple Line Metro station. Perfect for tech professionals and families.",
      propertyType: "apartment",
      listingType: "sale",
      bhk: 2,
      bathrooms: 2,
      price: 8800000, // 88 Lac
      areaSqFt: 1220,
      city: "Bengaluru",
      locality: "Whitefield",
      address: "Prestige Shantiniketan, ITPL Main Road, Whitefield",
      possessionStatus: "ready",
      furnishing: "semi",
      amenities: [
        "24/7 Security",
        "Covered Parking",
        "Power Backup",
        "Children Play Area",
        "Jogging Track",
        "Gated Community",
      ],
      images: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: seller1Id,
      isFeatured: true,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "Independent 4 BHK Designer Villa with Private Lawn",
      description:
        "Palatial triplex independent villa with private landscaped garden, home theatre room, rooftop barbecue terrace, and servant quarters. Built on a 300 sq.yard plot in Gachibowli's most prestigious gated enclave near Financial District.",
      propertyType: "villa",
      listingType: "sale",
      bhk: 4,
      bathrooms: 5,
      price: 32000000, // 3.20 Cr
      areaSqFt: 3450,
      city: "Hyderabad",
      locality: "Gachibowli",
      address: "Villa 18, Whispering Meadows, Gachibowli Financial District",
      possessionStatus: "ready",
      furnishing: "furnished",
      amenities: [
        "24/7 Security",
        "Covered Parking",
        "Power Backup",
        "Swimming Pool",
        "Clubhouse",
        "Gated Community",
        "Private Garden",
      ],
      images: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: seller2Id,
      isFeatured: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "Spacious 2 BHK High-Rise Apartment for Rent",
      description:
        "Fully furnished 2 BHK flat available for immediate rent in Kharadi, Pune. Includes 2 inverter air conditioners, smart 55-inch LED TV, double-door refrigerator, automatic front-load washing machine, and high-speed Wi-Fi connectivity.",
      propertyType: "apartment",
      listingType: "rent",
      bhk: 2,
      bathrooms: 2,
      price: 38000, // 38k / mo
      areaSqFt: 1100,
      city: "Pune",
      locality: "Kharadi",
      address: "EON Waterfront Phase 2, Near World Trade Centre, Kharadi",
      possessionStatus: "ready",
      furnishing: "furnished",
      amenities: [
        "24/7 Security",
        "Covered Parking",
        "Gymnasium",
        "Swimming Pool",
        "High Speed Elevators",
        "Power Backup",
      ],
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab32f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: faishalId,
      isFeatured: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "Grade-A Plug-and-Play Commercial Office in Cyber City",
      description:
        "Grade-A fully plug-and-play corporate office space with 45 workstations, 2 executive cabins, 12-seater boardroom with video conferencing equipment, cafeteria, and server room. Ideal for IT firms, consulting MNCs, or fintech companies.",
      propertyType: "commercial",
      listingType: "rent",
      bhk: 0,
      bathrooms: 3,
      price: 165000, // 1.65 Lac / mo
      areaSqFt: 2800,
      city: "Delhi NCR",
      locality: "DLF Cyber City",
      address: "Building 10, DLF Cyber City, Phase 2, Gurugram",
      possessionStatus: "ready",
      furnishing: "furnished",
      amenities: [
        "24/7 Security",
        "100% Power Backup",
        "Central Air Conditioning",
        "High Speed Elevators",
        "Covered Parking",
        "CCTV Surveillance",
      ],
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: seller3Id,
      isFeatured: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "Residential Corner Plot in Gated Township on OMR",
      description:
        "CMDA approved east-facing corner plot measuring 2400 sq.ft inside an exclusive gated community on OMR Chennai. Complete with 40-foot blacktop wide roads, underground cabling, avenue plantation, and sweet potable groundwater.",
      propertyType: "plot",
      listingType: "sale",
      bhk: 0,
      bathrooms: 0,
      price: 7500000, // 75 Lac
      areaSqFt: 2400,
      city: "Chennai",
      locality: "OMR (Old Mahabalipuram Road)",
      address: "Plot 42, Hiranandani Parks, Navalur, OMR",
      possessionStatus: "ready",
      furnishing: "unfurnished",
      amenities: [
        "24/7 Security",
        "Gated Community",
        "Water Storage",
        "Blacktop Roads",
        "Street Lighting",
      ],
      images: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: seller1Id,
      isFeatured: false,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "Heritage 3 BHK Portuguese Holiday Villa with Pool",
      description:
        "Stunning colonial Portuguese-style villa nestled amidst swaying coconut groves. Features exposed laterite walls, private swimming pool with sundeck, high wooden ceilings, and landscaped tropical gardens. 5 minutes drive from Candolim Beach.",
      propertyType: "villa",
      listingType: "sale",
      bhk: 3,
      bathrooms: 4,
      price: 28500000, // 2.85 Cr
      areaSqFt: 2900,
      city: "Goa",
      locality: "Candolim",
      address: "Villa Verde, Fort Aguada Road, Candolim, North Goa",
      possessionStatus: "ready",
      furnishing: "furnished",
      amenities: [
        "Private Pool",
        "Landscaped Garden",
        "24/7 Security",
        "Covered Parking",
        "Power Backup",
        "Pet Friendly",
      ],
      images: [
        "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: seller2Id,
      isFeatured: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "Cozy 1 BHK Studio Apartment for Rent in Indiranagar",
      description:
        "Tastefully designed contemporary 1 BHK apartment situated in prime Indiranagar. Walking distance to 100ft Road cafes, metro station, and boutique eateries. Features modular kitchen, high-speed fiber internet, and biometric entry.",
      propertyType: "apartment",
      listingType: "rent",
      bhk: 1,
      bathrooms: 1,
      price: 28000, // 28k / mo
      areaSqFt: 650,
      city: "Bengaluru",
      locality: "Indiranagar",
      address: "12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru",
      possessionStatus: "ready",
      furnishing: "furnished",
      amenities: [
        "Power Backup",
        "24/7 Security",
        "Covered Parking",
        "CCTV Surveillance",
        "Air Conditioning",
      ],
      images: [
        "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: faishalId,
      isFeatured: false,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "Ultra-Premium 4 BHK Sky Mansion on Golf Course Road",
      description:
        "Exclusive single-floor sky residence overlooking the championship golf course. Boasts private plunge pool, VRV central air-conditioning, Italian marble finishes, smart home automation, and dedicated staff quarters.",
      propertyType: "apartment",
      listingType: "sale",
      bhk: 4,
      bathrooms: 5,
      price: 75000000, // 7.50 Cr
      areaSqFt: 4200,
      city: "Delhi NCR",
      locality: "Golf Course Road",
      address: "The Magnolias, Sector 42, Golf Course Road, Gurugram",
      possessionStatus: "ready",
      furnishing: "furnished",
      amenities: [
        "Golf Course View",
        "Swimming Pool",
        "Clubhouse",
        "Private Elevator",
        "24/7 Security",
        "4 Covered Parkings",
        "Concierge Service",
      ],
      images: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: seller3Id,
      isFeatured: true,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "Contemporary 3 BHK Lake-Facing Flat in Baner",
      description:
        "Modern 3 BHK apartment with large scenic sit-out balcony. Equipped with solar water heating, piped gas connection, video door phone, and premium sanitary fittings. Located in close proximity to Balewadi High Street.",
      propertyType: "apartment",
      listingType: "sale",
      bhk: 3,
      bathrooms: 3,
      price: 13500000, // 1.35 Cr
      areaSqFt: 1550,
      city: "Pune",
      locality: "Baner",
      address: "Kasturi The Balmoral, Pan Card Club Road, Baner, Pune",
      possessionStatus: "ready",
      furnishing: "semi",
      amenities: [
        "24/7 Security",
        "Covered Parking",
        "Gymnasium",
        "Swimming Pool",
        "Children Play Area",
        "Clubhouse",
      ],
      images: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: seller1Id,
      isFeatured: false,
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "Prime High-Street Retail Showroom on Linking Road",
      description:
        "High-visibility corner commercial retail showroom with massive 40-foot glass frontage on Linking Road, Bandra West. Enjoys heavy footfall from upscale shoppers. Perfect for flagship fashion brands, jewelry stores, or premium cafes.",
      propertyType: "commercial",
      listingType: "rent",
      bhk: 0,
      bathrooms: 2,
      price: 220000, // 2.20 Lac / mo
      areaSqFt: 1400,
      city: "Mumbai",
      locality: "Bandra West",
      address: "Linking Road, Opposite National College, Bandra West, Mumbai",
      possessionStatus: "ready",
      furnishing: "semi",
      amenities: [
        "High Footfall",
        "24/7 Security",
        "Power Backup",
        "Covered Parking",
        "Air Conditioning",
      ],
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: seller2Id,
      isFeatured: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "Charming 3 BHK Heritage Apartment in Ballygunge",
      description:
        "Spacious colonial-inspired flat located in south Kolkata's aristocratic residential address. High 11-foot ceilings, Burmese teak doors, expansive living room, and manicured private courtyard views.",
      propertyType: "apartment",
      listingType: "sale",
      bhk: 3,
      bathrooms: 3,
      price: 14500000, // 1.45 Cr
      areaSqFt: 1750,
      city: "Kolkata",
      locality: "Ballygunge",
      address: "Queens Park Enclave, Ballygunge Circular Road, Kolkata",
      possessionStatus: "ready",
      furnishing: "semi",
      amenities: [
        "24/7 Security",
        "Covered Parking",
        "Power Backup",
        "Gymnasium",
        "Community Hall",
      ],
      images: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: faishalId,
      isFeatured: false,
      createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "Budget-Friendly 1 BHK Flat for Rent in Hinjewadi Phase 1",
      description:
        "Comfortable 1 BHK flat in a gated township right next to Rajiv Gandhi Infotech Park. Ideal for software engineers looking for minimal commute. Features 24/7 security, club facilities, and supermarket on premise.",
      propertyType: "apartment",
      listingType: "rent",
      bhk: 1,
      bathrooms: 1,
      price: 19000, // 19k / mo
      areaSqFt: 600,
      city: "Pune",
      locality: "Hinjewadi",
      address: "Blue Ridge Township, Phase 1, Hinjewadi, Pune",
      possessionStatus: "ready",
      furnishing: "semi",
      amenities: [
        "24/7 Security",
        "Covered Parking",
        "Power Backup",
        "Clubhouse",
        "Gymnasium",
      ],
      images: [
        "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab32f?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: seller1Id,
      isFeatured: false,
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "Palatial 5 BHK Gated Villa in Jubilee Hills",
      description:
        "Architectural masterpiece set atop Jubilee Hills offering mesmerizing city skyline vistas. Features private glass elevator, infinity pool, 8-seater home theatre with Dolby Atmos, temperature-controlled wine cellar, and manicured Zen garden.",
      propertyType: "villa",
      listingType: "sale",
      bhk: 5,
      bathrooms: 6,
      price: 89000000, // 8.90 Cr
      areaSqFt: 5500,
      city: "Hyderabad",
      locality: "Jubilee Hills",
      address: "Road No. 36, Jubilee Hills, Hyderabad",
      possessionStatus: "ready",
      furnishing: "furnished",
      amenities: [
        "Private Pool",
        "Home Theatre",
        "24/7 Security",
        "Power Backup",
        "Clubhouse",
        "Gated Community",
        "4 Covered Parkings",
      ],
      images: [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: seller3Id,
      isFeatured: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "Under-Construction 2 BHK Lakeview Flat in Bellandur",
      description:
        "High-return investment opportunity in Bangalore's prime IT belt. East facing unit with unblocked panoramic views of Bellandur Lake. Possession starting within 8 months. RERA certified project.",
      propertyType: "apartment",
      listingType: "sale",
      bhk: 2,
      bathrooms: 2,
      price: 9500000, // 95 Lac
      areaSqFt: 1180,
      city: "Bengaluru",
      locality: "Bellandur",
      address: "Sobha Dream Acres, Outer Ring Road, Bellandur, Bengaluru",
      possessionStatus: "under_construction",
      furnishing: "unfurnished",
      amenities: [
        "Lake View",
        "Swimming Pool",
        "Badminton Court",
        "Clubhouse",
        "24/7 Security",
        "Covered Parking",
      ],
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: seller1Id,
      isFeatured: false,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "HMDA Approved Residential Villa Plot in Shamshabad",
      description:
        "Clear title, HMDA approved villa plot inside a 50-acre gated enclave near Rajiv Gandhi International Airport. Ready for immediate construction with wide underground drainage, electricity cables, water connections, and 24/7 security.",
      propertyType: "plot",
      listingType: "sale",
      bhk: 0,
      bathrooms: 0,
      price: 4800000, // 48 Lac
      areaSqFt: 1800,
      city: "Hyderabad",
      locality: "Shamshabad",
      address: "Green Acres Enclave, Hyderabad-Bangalore Highway, Shamshabad",
      possessionStatus: "ready",
      furnishing: "unfurnished",
      amenities: [
        "HMDA Approved",
        "Gated Community",
        "24/7 Security",
        "Underground Drainage",
        "Street Lighting",
      ],
      images: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: seller2Id,
      isFeatured: false,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      title: "Sea-Breeze 2 BHK Furnished Apartment for Rent in Besant Nagar",
      description:
        "Delightful sea-breeze apartment located only 200 meters from Elliot's Beach. Fully furnished with modular teak furniture, 2 air conditioners, covered car parking, and 24-hour sweet municipal water supply.",
      propertyType: "apartment",
      listingType: "rent",
      bhk: 2,
      bathrooms: 2,
      price: 42000, // 42k / mo
      areaSqFt: 1250,
      city: "Chennai",
      locality: "Besant Nagar",
      address: "5th Avenue, Near Elliot's Beach, Besant Nagar, Chennai",
      possessionStatus: "ready",
      furnishing: "furnished",
      amenities: [
        "Sea Breeze",
        "Covered Parking",
        "Power Backup",
        "24/7 Security",
        "Pet Friendly",
      ],
      images: [
        "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab32f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      ],
      owner: seller1Id,
      isFeatured: false,
      createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
  ];

  const insertResult = await propertiesCollection.insertMany(properties);
  console.log(`Inserted ${insertResult.insertedCount} properties successfully!`);

  // Sample viewing appointments
  const worliProp = await propertiesCollection.findOne({ locality: { $regex: "Worli", $options: "i" } });
  const kharadiProp = await propertiesCollection.findOne({ locality: { $regex: "Kharadi", $options: "i" } });
  const whitefieldProp = await propertiesCollection.findOne({ locality: { $regex: "Whitefield", $options: "i" } });

  const futureDate1 = new Date();
  futureDate1.setDate(futureDate1.getDate() + 3);

  const futureDate2 = new Date();
  futureDate2.setDate(futureDate2.getDate() + 5);

  const futureDate3 = new Date();
  futureDate3.setDate(futureDate3.getDate() + 7);

  const appointments = [];

  if (worliProp) {
    appointments.push({
      property: worliProp._id,
      guestName: "Amitabh Singhania",
      guestEmail: "amitabh.singhania@gmail.com",
      guestPhone: "9820199887",
      visitDate: futureDate1,
      timeSlot: "10:00 AM - 01:00 PM",
      status: "pending",
      notes: "Interested in visiting with my family. Would like to inspect the parking slots and clubhouse.",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  if (kharadiProp) {
    appointments.push({
      property: kharadiProp._id,
      guestName: "Neha Agarwal",
      guestEmail: "neha.agarwal@infotech.com",
      guestPhone: "9871122334",
      visitDate: futureDate2,
      timeSlot: "02:00 PM - 06:00 PM",
      status: "confirmed",
      notes: "Relocating from Bengaluru for a new role at EON Free Zone. Looking to finalize lease agreement.",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  if (whitefieldProp && faishalUser) {
    appointments.push({
      property: whitefieldProp._id,
      user: faishalUser._id,
      visitDate: futureDate3,
      timeSlot: "10:00 AM - 01:00 PM",
      status: "confirmed",
      notes: "Looking to purchase for investment portfolio. Request developer brochure upon arrival.",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  if (appointments.length > 0) {
    await appointmentsCollection.insertMany(appointments);
    console.log(`Inserted ${appointments.length} sample appointments successfully!`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
