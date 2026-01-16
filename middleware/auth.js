import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// ✅ FIXED: Now fetches FULL user data from MongoDB
export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ THE BIG FIX: Go to MongoDB and get ALL user info
    const User = mongoose.model("User");
    const user = await User.findById(decoded.userId).select("-password"); // exclude password
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    // ✅ NOW req.user has EVERYTHING: firstName, lastName, ownerphone, location, email, etc.
    req.user = user;
    req.userId = user._id; // Keep this for convenience
    
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};
