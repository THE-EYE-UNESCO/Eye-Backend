import mongoose from "mongoose";

export const connectToMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI).then(() => {
            console.log("Connected to MongoDB")
        })
    } catch (error) {
        throw new Error(error)
    }
}