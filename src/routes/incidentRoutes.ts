import { Router } from "express";
import {
  createIncident,
  deleteIncident,
  getIncidentById,
  getIncidents,
  patchIncident,
  replaceIncident
} from "../controllers/incidentController";

const router = Router();

router.get("/", getIncidents);
router.get("/:id", getIncidentById);
router.post("/", createIncident);
router.put("/:id", replaceIncident);
router.patch("/:id", patchIncident);
router.delete("/:id", deleteIncident);

export default router;
