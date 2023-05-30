import express from 'express';

import authenticateToken from '../middleware/authenticate-token';
import imageUpload from '../middleware/image-upload';
import * as EmployeesController from '../controllers/employees';

const router = express.Router();

router.get('/', authenticateToken, EmployeesController.getEmployees);
router.get('/:employeeId', authenticateToken, EmployeesController.getEmployeeById);
router.post('/', imageUpload, authenticateToken, EmployeesController.createEmployee);
router.patch('/:employeeId', imageUpload, authenticateToken, EmployeesController.updateEmployee);
router.delete('/:employeeId', authenticateToken, EmployeesController.deleteEmployee);

export default router;
