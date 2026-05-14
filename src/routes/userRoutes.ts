import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  patchUser,
  replaceUser
} from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", replaceUser);
router.patch("/:id", patchUser);
router.delete("/:id", deleteUser);

export default router;
