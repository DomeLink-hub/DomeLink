-- Migration: migrate_mongo_models_to_postgres
-- Adds Notification, Review, and SavedArchitect tables, migrated from MongoDB/Mongoose.

-- Notification
CREATE TABLE "Notification" (
    "id"        TEXT          NOT NULL,
    "userId"    TEXT          NOT NULL,
    "type"      TEXT          NOT NULL DEFAULT 'system',
    "title"     TEXT          NOT NULL DEFAULT '',
    "body"      TEXT          NOT NULL DEFAULT '',
    "read"      BOOLEAN       NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)  NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

ALTER TABLE "Notification"
    ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Review
CREATE TABLE "Review" (
    "id"         TEXT         NOT NULL,
    "reviewerId" TEXT         NOT NULL,
    "revieweeId" TEXT         NOT NULL,
    "projectId"  TEXT,
    "rating"     INTEGER      NOT NULL,
    "comment"    TEXT         NOT NULL DEFAULT '',
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");
CREATE INDEX "Review_revieweeId_idx" ON "Review"("revieweeId");

ALTER TABLE "Review"
    ADD CONSTRAINT "Review_reviewerId_fkey"
    FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review"
    ADD CONSTRAINT "Review_revieweeId_fkey"
    FOREIGN KEY ("revieweeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SavedArchitect
CREATE TABLE "SavedArchitect" (
    "id"             TEXT         NOT NULL,
    "userId"         TEXT         NOT NULL,
    "architectId"    TEXT         NOT NULL,
    "collectionName" TEXT         DEFAULT '',
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedArchitect_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SavedArchitect_userId_idx"      ON "SavedArchitect"("userId");
CREATE INDEX "SavedArchitect_architectId_idx" ON "SavedArchitect"("architectId");
CREATE UNIQUE INDEX "SavedArchitect_userId_architectId_key" ON "SavedArchitect"("userId", "architectId");

ALTER TABLE "SavedArchitect"
    ADD CONSTRAINT "SavedArchitect_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SavedArchitect"
    ADD CONSTRAINT "SavedArchitect_architectId_fkey"
    FOREIGN KEY ("architectId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
