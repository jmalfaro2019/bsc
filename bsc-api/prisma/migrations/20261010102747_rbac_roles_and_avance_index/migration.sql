-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'lector';

-- CreateIndex
CREATE INDEX "avances_snapshot_id_idx" ON "avances"("snapshot_id");
