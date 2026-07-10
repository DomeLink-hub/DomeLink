// WARNING: DEV-ONLY SCRIPT — creates SYNTHETIC test data.
// DO NOT RUN THIS AGAINST A PRODUCTION DATABASE.
// This file was moved from ../addConsultations.mjs during local development.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(){
  const architect = await prisma.user.findUnique({ where: { email: 'demo.architect@domelink.com' } });
  const client = await prisma.user.findUnique({ where: { email: 'demo.client@domelink.com' } });
  if(!architect || !client){
    console.error('Demo users not found');
    process.exit(1);
  }

  for(let i=0;i<2;i++){
    await prisma.consultation.create({
      data: {
        userId: client.id,
        architectId: architect.id,
        message: `Automated seed consultation ${i+1}`,
        projectType: 'Residential Ground-Up',
        budget: 5000000 + i*1000000,
        timeline: '6-12 months',
        status: 'ACCEPTED',
        amount: 4999,
      },
    });
  }

  console.log('Added 2 consultations (dev-only)');
  await prisma.$disconnect();
}

main().catch((e)=>{console.error(e); prisma.$disconnect(); process.exit(1);});
