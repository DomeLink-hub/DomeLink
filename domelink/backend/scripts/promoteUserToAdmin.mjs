import prisma from '../dist/config/prisma.js';

const id = process.argv[2];
if (!id) {
  console.error('Usage: node promoteUserToAdmin.mjs <userId>');
  process.exit(2);
}

async function run() {
  const user = await prisma.user.update({ where: { id }, data: { role: 'ADMIN' } });
  console.log('Promoted user:', user.id, user.email, user.role);
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
