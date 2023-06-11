import express from 'express';

import verifyTokenMiddleware from '../middleware/verifyTokenMiddleware';
import imageUploadMiddleware from '../middleware/imageUploadMiddleware';
import * as employeesController from '../controllers/employeesController';

const router = express.Router();

router.get('/', verifyTokenMiddleware, employeesController.getEmployees);
router.get('/:employeeId', verifyTokenMiddleware, employeesController.getEmployeeById);
router.post('/', imageUploadMiddleware, verifyTokenMiddleware, employeesController.createEmployee);
router.patch('/:employeeId', imageUploadMiddleware, verifyTokenMiddleware, employeesController.updateEmployee);
router.delete('/:employeeId', verifyTokenMiddleware, employeesController.deleteEmployee);

export default router;
