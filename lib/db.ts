import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in .env.local");
}

export default async function connectDB() {
    // 1 = connected, 2 = connecting
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    return await mongoose.connect(MONGODB_URI!);
}