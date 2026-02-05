import express from "express";
import User from "../models/User";
import { sendWelcomeEmail } from "../utils/emailService";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user (save Firebase user to MongoDB)
// @access  Public
router.post("/register", async (req, res) => {
    console.log("Received registration request for:", req.body);
    const { uid, email, fullName, photoURL } = req.body;

    try {
        let user = await User.findOne({ uid });

        if (user) {
            if (user.isBlocked) {
                console.warn(`[Auth] Blocked user attempt to sign in: ${uid}`);
                return res.status(403).json({
                    success: false,
                    error: "Your account has been blocked.",
                    reason: user.blockReason || "Violation of platform terms."
                });
            }
            console.log("User already exists in MongoDB:", uid);
            return res.status(200).json({ msg: "User already exists", user });
        }

        user = new User({
            uid,
            email,
            fullName,
            photoURL,
            role: email.includes('admin') ? 'admin' : 'user'
        });

        await user.save();
        console.log("User successfully saved to MongoDB:", uid);

        // Send welcome email asynchronously
        sendWelcomeEmail(email, fullName).catch(err => console.error("Email trigger error:", err));

        res.status(201).json(user);
    } catch (err: any) {
        console.error("Error saving user to MongoDB:", err.message);
        res.status(500).send("Server error");
    }
});

export default router;
