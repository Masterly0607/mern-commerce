import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// use for grouping routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});

// Note
// Note1: app.use(express.json()); // “Hey Express,  parse JSON request bodies and put the result in req.body.” parse = Parse = convert raw text into a structured format the program can understand and use. Parse JSON = turn a JSON text (string) into a real JavaScript object.
// Explain in detail:
// 1. HTTP body arrives as a stream, chunk by chunk: chunk 1 → "{", chunk 2 → ""email":"a@gmail.com"", chunk 3 → "}"
// 2. express.json() = Behind the scenes: Reads all incoming chunks, Combines them into one string, Runs JSON.parse(), Assigns result to req.body.
