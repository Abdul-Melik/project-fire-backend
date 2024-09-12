import express from "express";

import verifyTokenMiddleware from "../middleware/verifyTokenMiddleware";
import validateResourceMiddleware from "../middleware/validateResourceMiddleware";
import {
  getProjectSchema,
  getProjectsInfoSchema,
  createProjectSchema,
  updateProjectSchema,
} from "../schemas/projectSchemas";
import * as projectsController from "../controllers/projectsController";

const router = express.Router();

router.use(verifyTokenMiddleware);

router.get(
  "/",
  validateResourceMiddleware(getProjectSchema),
  projectsController.getProjects
);
router.get(
  "/info",
  validateResourceMiddleware(getProjectsInfoSchema),
  projectsController.getProjectsInfo
);
router.get("/:projectId", projectsController.getProjectById);
router.post(
  "/",
  validateResourceMiddleware(createProjectSchema),
  projectsController.createProject
);
router.patch(
  "/:projectId",
  validateResourceMiddleware(updateProjectSchema),
  projectsController.updateProject
);
router.delete("/:projectId", projectsController.deleteProject);

export default router;
