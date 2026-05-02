import { Router } from 'express';
import { getLog } from '../controllers/log.controller';

const router = Router();

router.get('/', getLog);

export default router;