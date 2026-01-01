import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

export const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({ fullName, email, password });
    res.status(201).json({ token: generateToken(user._id), user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};
// Add these temporary mock endpoints
export const getFinancialData = async (req, res) => {
  res.json({
    monthlyData: [
      { month: "Jan", income: 4500, expenses: 3200 },
      { month: "Feb", income: 5200, expenses: 4100 },
      // ... more mock data
    ],
    expenseCategories: [
      { name: "Food", value: 1200 },
      // ... more categories
    ],
  });
};

export const getExpenses = async (req, res) => {
  res.json({
    categories: [
      { name: "Food", amount: 1200 },
      // ... more categories
    ],
    transactions: [
      // ... mock transactions
    ],
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
};
