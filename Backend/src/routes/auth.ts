import express from "express";
import User from "../models/User";

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
            console.log("User already exists in MongoDB:", uid);
            return res.status(200).json({ msg: "User already exists", user });
        }

        user = new User({
            uid,
            email,
            fullName,
            photoURL,
        });

        await user.save();
        console.log("User successfully saved to MongoDB:", uid);

        res.status(201).json(user);
    } catch (err: any) {
        console.error("Error saving user to MongoDB:", err.message);
        res.status(500).send("Server error");
    }
});

export default router;
