-- CreateTable
CREATE TABLE "progress_records" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot_id" TEXT,

    CONSTRAINT "progress_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snapshots" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "progress_records_activityId_recorded_at_idx" ON "progress_records"("activityId", "recorded_at");

-- CreateIndex
CREATE INDEX "progress_records_snapshot_id_idx" ON "progress_records"("snapshot_id");

-- AddForeignKey
ALTER TABLE "progress_records" ADD CONSTRAINT "progress_records_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_records" ADD CONSTRAINT "progress_records_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
