import { Router } from 'express';
import { asyncRouteHandler } from 'middlewares';
import * as controller from './controller';
import { authenticationMiddleware } from 'middlewares/auth';

const router = Router();

router.post('/', authenticationMiddleware, asyncRouteHandler(controller.pushCookies));
router.delete('/', authenticationMiddleware, asyncRouteHandler(controller.removeAllCookies));

export default router;
