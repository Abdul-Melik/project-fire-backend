import express from 'express';

import authenticateTokenMiddleware from '../middleware/authenticateTokenMiddleware';
import imageUploadMiddleware from '../middleware/imageUploadMiddleware';
import * as employeesController from '../controllers/employeesController';

const router = express.Router();

router.get('/', authenticateTokenMiddleware, employeesController.getEmployees);
router.get('/:employeeId', authenticateTokenMiddleware, employeesController.getEmployeeById);
router.post('/', imageUploadMiddleware, authenticateTokenMiddleware, employeesController.createEmployee);
router.patch('/:employeeId', imageUploadMiddleware, authenticateTokenMiddleware, employeesController.updateEmployee);
router.delete('/:employeeId', authenticateTokenMiddleware, employeesController.deleteEmployee);

export default router;
