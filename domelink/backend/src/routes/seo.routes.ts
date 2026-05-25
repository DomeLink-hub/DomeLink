import { Router } from 'express';
import { getOgImage, getRobots, getSitemap } from '../controllers/seo.controller.js';

const router = Router();

router.get('/robots.txt', getRobots);
router.get('/sitemap.xml', getSitemap);
router.get('/og', getOgImage);

export default router;
