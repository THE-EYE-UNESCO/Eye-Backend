import { login, logout, register } from "../controllers/auth.controllers.js";
import express from "express"
import { authorise } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", authorise, logout);

export default authRouter