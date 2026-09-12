import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and prevent connections growing exponentially in serverless functions.
 */
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache ?? { conn: null, promise: null };


export default async function connectDB(): Promise<typeof mongoose> {
    // 1. Return existing connection if ready
    if (cached.conn) {
        return cached.conn;
    }

    // 2. If no connection attempt is in progress, create a new promise
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Prevents queries hanging when disconnected
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
            console.log(`MongoDB connected to host: ${mongooseInstance.connection.host}`);
            return mongooseInstance;
        });
    }

    try {
        // 3. Await connection completion and cache it
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        // 4. Clear promise on failure so next request can try again cleanly
        cached.promise = null;
        console.error("MongoDB Connection Error:", error);
        throw error; // CRITICAL: Re-throw so server actions catch connection failures
    }
}