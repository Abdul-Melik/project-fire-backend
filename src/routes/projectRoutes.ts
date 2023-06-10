import express from 'express';

import authenticateTokenMiddleware from '../middleware/authenticateTokenMiddleware';
import * as projectsController from '../controllers/projectsController';

const router = express.Router();

router.get('/', authenticateTokenMiddleware, projectsController.getProjects);
router.get('/info', authenticateTokenMiddleware, projectsController.getProjectsInfo);
router.get('/:projectId', authenticateTokenMiddleware, projectsController.getProjectById);
router.post('/', authenticateTokenMiddleware, projectsController.createProject);
router.patch('/:projectId', authenticateTokenMiddleware, projectsController.updateProject);
router.delete('/:projectId', authenticateTokenMiddleware, projectsController.deleteProject);

export default router;
