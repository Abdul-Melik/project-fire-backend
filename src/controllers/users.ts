import { RequestHandler } from "express";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { UserModel, UserRole } from "../models/user";
import jwt from "jsonwebtoken";
import env from "../utils/validate-env";
import { authenticateToken } from "../middleware/authenticateToken";

interface RegisterUserBody {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
}

interface LoginUserBody {
  email?: string;
  password?: string;
  rememberMe?: boolean;
}

export const registerUser: RequestHandler<
  unknown,
  unknown,
  RegisterUserBody,
  unknown
> = async (req, res, next) => {
  const { email, password, name, role } = req.body;
  try {
    if (!email || !password || !name || !role)
      throw createHttpError(400, "Missing required fields.");
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) throw createHttpError(409, "Email already registered.");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await UserModel.create({
      email,
      password: hashedPassword,
      name,
      role,
    });

    const expireLength = "30d";
    const user = await UserModel.findOne({ email });
    const token = jwt.sign({ userId: user!._id }, env.JWT_SECRET, {
      expiresIn: expireLength,
    });
    return res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
};

export const loginUser: RequestHandler<
  unknown,
  unknown,
  LoginUserBody,
  unknown
> = async (req, res, next) => {
  const { email, password, rememberMe } = req.body;
  try {
    if (!email || !password)
      throw createHttpError(400, "Missing required fields.");
    const user = await UserModel.findOne({ email });
    if (!user) throw createHttpError(401, "Invalid email or password.");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw createHttpError(401, "Invalid email or password.");

    const expireLength = rememberMe ? "30d" : "1d";
    const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
      expiresIn: expireLength,
    });

    return res.status(200).json({ token, expireLength });
  } catch (error) {
    next(error);
  }
};
