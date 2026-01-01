import {
  registerUser,
  loginUser,
  getUserInfo,
} from "../controllers/authController.js";
import User from "../models/User.js";
//import jwt from "jsonwebtoken";
import { expect, jest } from "@jest/globals";

// Mock the User model
jest.mock("../models/User.js");

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "fake-token"), // Mock jwt.sign correctly
}));

// Define the mock implementations
User.create = jest.fn();
User.findOne = jest.fn();
User.findById = jest.fn();

// Ensure required environment variables are set
process.env.JWT_SECRET = "test-secret";

describe("Auth Controller", () => {
  let req, res;

  beforeEach(() => {
    // Reset the mocks before each test
    jest.clearAllMocks();

    // Mock request and response objects
    req = {
      body: {},
      params: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // Test for registerUser
  describe("registerUser", () => {
    it("should register a new user and return 201", async () => {
      req.body = {
        fullName: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      User.create.mockResolvedValue({
        _id: "123",
        fullName: "John Doe",
        email: "john@example.com",
      });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: "123",
        user: {
          _id: "123",
          fullName: "John Doe",
          email: "john@example.com",
        },
        token: expect.any(String),
      });
    });

    it("should return 400 if required fields are missing", async () => {
      // Mock request body with missing fields
      req.body = {
        fullName: "John Doe",
        // email and password are missing
      };

      await registerUser(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "All fields are required",
      });
    });

    it("should return 400 if email is already in use", async () => {
      // Mock request body
      req.body = {
        fullName: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      // Mock User.findOne to return an existing user
      User.findOne.mockResolvedValue({
        email: "john@example.com",
      });

      await registerUser(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email already in use",
      });
    });
  });

  // Test for loginUser
  describe("loginUser", () => {
    it("should log in a user and return 200 status with token", async () => {
      // Mock request body
      req.body = {
        email: "john@example.com",
        password: "password123",
      };

      // Mock User.findOne to return a user
      const mockUser = {
        _id: "123",
        email: "john@example.com",
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);

      // Mock jwt.sign to return a token
      //jwt.sign.mockReturnValue("fake-token");

      await loginUser(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: "123",
        user: mockUser,
        token: expect.any(String),
      });
    });

    it("should return 400 if email or password is missing", async () => {
      // Mock request body with missing fields
      req.body = {
        email: "john@example.com",
        // password is missing
      };

      await loginUser(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "All fields are required",
      });
    });

    it("should return 400 if credentials are invalid", async () => {
      // Mock request body
      req.body = {
        email: "john@example.com",
        password: "wrongpassword",
      };

      // Mock User.findOne to return a user
      const mockUser = {
        _id: "123",
        email: "john@example.com",
        comparePassword: jest.fn().mockResolvedValue(false), // Password doesn't match
      };
      User.findOne.mockResolvedValue(mockUser);

      await loginUser(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid credential",
      });
    });
  });

  // Test for getUserInfo
  describe("getUserInfo", () => {
    it("should return user info if user is authenticated", async () => {
      req.user = { id: "123" }; // Ensure req.user is defined

      const mockUser = {
        _id: "123",
        fullName: "John Doe",
        email: "john@example.com",
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await getUserInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("should return 404 if user is not found", async () => {
      // Mock req.user
      req.user = { id: "123" };

      // Mock User.findById to return null (user not found)
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await getUserInfo(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    it("should return user info if user is authenticated", async () => {
      req.user = { id: "123" }; // Ensure req.user is defined

      const mockUser = {
        _id: "123",
        fullName: "John Doe",
        email: "john@example.com",
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await getUserInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
  });
});
