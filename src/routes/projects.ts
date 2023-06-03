import express from 'express';

import authenticateToken from '../middleware/authenticate-token';
import * as projectsController from '../controllers/projects';

const router = express.Router();

router.get('/', authenticateToken, projectsController.getProjects);
router.get('/info', authenticateToken, projectsController.getProjectsInfo);
router.get('/:projectId', authenticateToken, projectsController.getProjectById);
router.post('/', authenticateToken, projectsController.createProject);
router.patch('/:projectId', authenticateToken, projectsController.updateProject);
router.delete('/:projectId', authenticateToken, projectsController.deleteProject);

export default router;
