import mongoose from "mongoose";

async function connectDB() {
  return await mongoose.connect(process.env.MONGO_URI);
}

export default connectDB;
