import express from "express";

import verifyTokenMiddleware from "../middleware/verifyTokenMiddleware";
import imageUploadMiddleware from "../middleware/imageUploadMiddleware";
import validateResourceMiddleware from "../middleware/validateResourceMiddleware";
import {
  getEmployeesSchema,
  getEmployeesInfoSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
} from "../schemas/employeeSchemas";
import * as employeesController from "../controllers/employeesController";

const router = express.Router();

router.use(verifyTokenMiddleware);

router.get(
  "/",
  validateResourceMiddleware(getEmployeesSchema),
  employeesController.getEmployees
);
router.get(
  "/info",
  validateResourceMiddleware(getEmployeesInfoSchema),
  employeesController.getEmployeesInfo
);
router.get("/:employeeId", employeesController.getEmployeeById);
router.post(
  "/",
  imageUploadMiddleware,
  validateResourceMiddleware(createEmployeeSchema),
  employeesController.createEmployee
);
router.patch(
  "/:employeeId",
  imageUploadMiddleware,
  validateResourceMiddleware(updateEmployeeSchema),
  employeesController.updateEmployee
);
router.delete("/:employeeId", employeesController.deleteEmployee);

export default router;
