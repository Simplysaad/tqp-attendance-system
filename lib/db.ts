import mongoose from "mongoose"

export default async function connectDB() {
    const MONGO_URI = process.env.MONGO_URI || ""
    try {
        const conn = await mongoose.connect(MONGO_URI);

        if (conn) {
            console.log(`connection established at ${conn.connection.host}`)
        }
    } catch (error) {
        console.error(error)
    }
}