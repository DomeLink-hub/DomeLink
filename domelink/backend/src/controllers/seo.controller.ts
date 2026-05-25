import type { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const baseUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

export const getRobots = asyncHandler(async (_req: Request, res: Response) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml`);
});

export const getSitemap = asyncHandler(async (_req: Request, res: Response) => {
  const [architects, portfolios, projects] = await Promise.all([
    prisma.user.findMany({ where: { role: 'ARCHITECT' }, select: { slug: true, updatedAt: true } }),
    prisma.portfolioProject.findMany({ select: { id: true, updatedAt: true } }),
    prisma.project.findMany({ select: { id: true, updatedAt: true } }),
  ]);

  const entries = [
    `${baseUrl}/`,
    ...architects.filter((item) => item.slug).map((item) => `${baseUrl}/architects/${item.slug}`),
    ...portfolios.map((item) => `${baseUrl}/portfolio/${item.id}`),
    ...projects.map((item) => `${baseUrl}/projects/${item.id}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries
    .map((url) => `<url><loc>${url}</loc></url>`)
    .join('')}</urlset>`;

  res.type('application/xml').send(xml);
});

export const getOgImage = asyncHandler(async (req: Request, res: Response) => {
  const title = decodeURIComponent(String(req.query.title || 'DomeLink'));
  const subtitle = decodeURIComponent(String(req.query.subtitle || 'Architectural intelligence for premium projects'));

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f0f10" />
          <stop offset="100%" stop-color="#2b241d" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)" />
      <text x="80" y="110" fill="#d8cdbd" font-size="26" font-family="Arial, sans-serif" letter-spacing="4">DomeLink</text>
      <text x="80" y="250" fill="#ffffff" font-size="72" font-weight="700" font-family="Arial, sans-serif">${title}</text>
      <text x="80" y="330" fill="#d8cdbd" font-size="28" font-family="Arial, sans-serif">${subtitle}</text>
    </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});
