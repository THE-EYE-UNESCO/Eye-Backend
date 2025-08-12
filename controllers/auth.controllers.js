import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generate.token.js";

export const register = async (req, res) => {
    const { fullname, username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ username: username }, { email: email }] });
        if (existingUser) return res.status(403).json({ message: "User already exists" });
        const user = new User({ fullname, username, email, password });
        await user.save();
        return res.status(201).json({ message: "User created" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email }).select("-role");
        if (!user) return res.status(404).json({ message: "No user with such credentials" })
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) return res.status(404).json({ message: "No user with such credentials" });
        await generateTokenAndSetCookie(user._id, res);
        return res.status(200).json({ message: "Logged in successfully" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const logout = async (req, res) => {
    const { id } = req.user;
    if (!id) return res.status(403).json({ message: "You should be logged in to logout" })
    try {
        return res.clearCookie("token")
            .status(200).json({ message: "Logged out" });
    } catch (error) {

    }
}