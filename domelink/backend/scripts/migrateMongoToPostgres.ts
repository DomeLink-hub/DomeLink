/**
 * One-time migration script: MongoDB → Postgres for Notification, Review, SavedArchitect.
 *
 * STATUS: NOT NEEDED — all 3 MongoDB collections were empty at time of migration.
 * Verified on 2026-07-02:
 *   - notifications:    0 documents
 *   - reviews:          0 documents
 *   - savedarchitects:  0 documents
 *
 * This file is kept for audit/reference only. Safe to delete if no longer needed.
 *
 * IF you ever need to run this (e.g. you restored a Mongo backup with real data):
 *   npx tsx scripts/migrateMongoToPostgres.ts
 */

import mongoose from "mongoose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error("MONGO_URI env var required");

  await mongoose.connect(MONGO_URI, { dbName: "domelink" });
  const db = mongoose.connection.db!;

  // Notifications
  const notifications = await db.collection("notifications").find({}).toArray();
  console.log(`Migrating ${notifications.length} notifications...`);
  for (const n of notifications) {
    const userId = String(n.user);
    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!userExists) { console.warn(`Skipping notification — user ${userId} not in Postgres`); continue; }
    await prisma.notification.create({
      data: { userId, type: n.type || "system", title: n.title || "", body: n.body || "", read: Boolean(n.read), createdAt: n.createdAt ?? new Date() },
    });
  }

  // Reviews
  const reviews = await db.collection("reviews").find({}).toArray();
  console.log(`Migrating ${reviews.length} reviews...`);
  for (const r of reviews) {
    const reviewerId = String(r.reviewer);
    const revieweeId = String(r.reviewee);
    const rExists = await prisma.user.findUnique({ where: { id: reviewerId }, select: { id: true } });
    const eExists = await prisma.user.findUnique({ where: { id: revieweeId }, select: { id: true } });
    if (!rExists || !eExists) { console.warn(`Skipping review — user not in Postgres`); continue; }
    await prisma.review.create({
      data: { reviewerId, revieweeId, rating: Number(r.rating), comment: r.comment || "", projectId: r.project ? String(r.project) : null, createdAt: r.createdAt ?? new Date() },
    });
  }

  // Saved Architects
  const saved = await db.collection("savedarchitects").find({}).toArray();
  console.log(`Migrating ${saved.length} saved architect records...`);
  for (const s of saved) {
    const userId = String(s.userId);
    const architectId = String(s.architectId);
    const uExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    const aExists = await prisma.user.findUnique({ where: { id: architectId }, select: { id: true } });
    if (!uExists || !aExists) { console.warn(`Skipping saved record — user not in Postgres`); continue; }
    await prisma.savedArchitect.upsert({
      where: { userId_architectId: { userId, architectId } },
      update: {},
      create: { userId, architectId, collectionName: s.collectionName || "" },
    });
  }

  console.log("Migration complete.");
  await mongoose.disconnect();
  await prisma.$disconnect();
}

main().catch(console.error);
