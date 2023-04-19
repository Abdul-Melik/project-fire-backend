import express from 'express';
import * as ProjectsController from '../controllers/projects';
import authenticateToken from '../middleware/authenticate-token';

const router = express.Router();

router.get('/', authenticateToken, ProjectsController.getProjects);
router.post('/', authenticateToken, ProjectsController.createProject);

export default router;
