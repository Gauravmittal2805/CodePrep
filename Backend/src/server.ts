import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import authRoutes from "./routes/auth";
import problemRoutes from "./routes/problems";
import codeRoutes from "./routes/code";
import discussionRoutes from "./routes/discussions";
import adminRoutes from "./routes/admin";
import dashboardRoutes from "./routes/dashboard";
import companyRoutes from "./routes/companies";
import aiRoutes from "./routes/ai";
import mockOARoutes from "./routes/mockOA";
import companyPatternRoutes from "./routes/companyPatterns";
import contestRoutes from "./routes/contest";
import interviewRoutes from "./routes/interviews";

(() => {
    const candidates = [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), 'Backend', '.env'),
        path.resolve(__dirname, '..', '.env'),
        path.resolve(__dirname, '..', '..', '.env')
    ];

    const envPath = candidates.find((p) => fs.existsSync(p));
    if (envPath) {
        dotenv.config({ path: envPath });
    } else {
        dotenv.config();
    }
})();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/mockoa", mockOARoutes);
app.use("/api/company-patterns", companyPatternRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/interviews", interviewRoutes);

// MongoDB Connection
mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/CodePrep")
    .then(() => console.log("Connected to MongoDB Compass"))
    .catch((err) => console.error("Could not connect to MongoDB:", err));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
