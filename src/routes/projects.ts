import express from "express";

import * as ProjectsController from "../controllers/projects";
import authenticateToken from "../middleware/authenticate-token";

const router = express.Router();

router.get("/", authenticateToken, ProjectsController.getProjects);
router.get("/info", authenticateToken, ProjectsController.getProjectsInfo);
router.get("/employees-per-project", authenticateToken, ProjectsController.getEmployeesPerProject);
router.get("/users-per-project", authenticateToken, ProjectsController.getUsersPerProject);
router.get("/:projectId", authenticateToken, ProjectsController.getProjectById);
router.get("/:projectId/employees", authenticateToken, ProjectsController.getEmployeesByProjectId);
router.get("/:projectId/users", authenticateToken, ProjectsController.getUsersByProjectId);
router.post("/", authenticateToken, ProjectsController.createProject);
router.patch("/:projectId", authenticateToken, ProjectsController.updateProject);
router.delete("/:projectId", authenticateToken, ProjectsController.deleteProject);

export default router;
