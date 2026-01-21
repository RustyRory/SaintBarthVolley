import express from "express";
import * as usersController from "../controllers/usersController.js";
const router = express.Router();

// Routes CRUD utilisateurs
router.get("/", usersController.getAllUsers);
router.get("/:id", usersController.getUserById);
router.post("/", usersController.createUser);
router.put("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);

export default router;
