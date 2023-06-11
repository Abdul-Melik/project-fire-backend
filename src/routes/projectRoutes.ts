import express from 'express';

import verifyTokenMiddleware from '../middleware/verifyTokenMiddleware';
import * as projectsController from '../controllers/projectsController';

const router = express.Router();

router.get('/', verifyTokenMiddleware, projectsController.getProjects);
router.get('/info', verifyTokenMiddleware, projectsController.getProjectsInfo);
router.get('/:projectId', verifyTokenMiddleware, projectsController.getProjectById);
router.post('/', verifyTokenMiddleware, projectsController.createProject);
router.patch('/:projectId', verifyTokenMiddleware, projectsController.updateProject);
router.delete('/:projectId', verifyTokenMiddleware, projectsController.deleteProject);

export default router;
