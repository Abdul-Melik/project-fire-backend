import express from 'express';

import authenticateToken from '../middleware/authenticate-token';
import * as EmployeesController from '../controllers/employees';

const router = express.Router();

router.get('/', authenticateToken, EmployeesController.getEmployees);
router.get('/:employeeId', authenticateToken, EmployeesController.getEmployeeById);
router.post('/add', authenticateToken, EmployeesController.addEmployee);
router.delete('/:employeeId', authenticateToken, EmployeesController.removeEmployee);

export default router;
