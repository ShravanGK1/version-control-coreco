import { Router } from 'express';
import { getProjects } from '../controllers/projectController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateJwt, getProjects);

export default router;
