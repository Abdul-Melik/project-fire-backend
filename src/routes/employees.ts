import express from 'express';

import authenticateToken from '../middleware/authenticate-token';
import imageUpload from '../middleware/image-upload';
import * as employeesController from '../controllers/employees';

const router = express.Router();

router.get('/', authenticateToken, employeesController.getEmployees);
router.get('/:employeeId', authenticateToken, employeesController.getEmployeeById);
router.post('/', imageUpload, authenticateToken, employeesController.createEmployee);
router.patch('/:employeeId', imageUpload, authenticateToken, employeesController.updateEmployee);
router.delete('/:employeeId', authenticateToken, employeesController.deleteEmployee);

export default router;
