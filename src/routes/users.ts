import express from "express";
import * as UsersController from "../controllers/users";

const router = express.Router();

router.post("/register", UsersController.registerUser);
router.post("/login", UsersController.loginUser);

export default router;
