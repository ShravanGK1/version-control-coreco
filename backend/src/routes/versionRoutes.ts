import { Router } from 'express';
import {
  getVersions,
  getNextVersionNumber,
  getVersionById,
  createVersion,
  updateVersion,
  toggleVersionStatus,
} from '../controllers/versionControlController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router = Router();

// Protect all version routes with JWT authentication
router.use(authenticateJwt);

// GET list of versions with filters & pagination
router.get('/', getVersions);

// CRITICAL ROUTE ORDER REQUIREMENT:
// GET next version number MUST be registered BEFORE GET /:id
router.get('/next-number', getNextVersionNumber);

// GET single version by ID
router.get('/:id', getVersionById);

// POST create new version
router.post('/', createVersion);

// PUT update existing version
router.put('/:id', updateVersion);

// PATCH toggle soft-delete status (is_active)
router.patch('/:id/toggle-status', toggleVersionStatus);

export default router;
