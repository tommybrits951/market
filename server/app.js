import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import connectDB from "./config/connectDB.js";
import userRouter from "./routes/userRoutes.js";

const PORT = process.env.PORT || 9000;
const app = express();

connectDB();

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(fileUpload());
app.use("/users", userRouter);

mongoose.connection.on("open", () => {
  console.log("connected to database");
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
});
