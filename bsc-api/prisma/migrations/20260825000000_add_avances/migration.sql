-- CreateTable
CREATE TABLE "avances" (
    "id" TEXT NOT NULL,
    "snapshot_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avance_items" (
    "id" TEXT NOT NULL,
    "avance_id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avance_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "avance_items_avance_id_idx" ON "avance_items"("avance_id");

-- AddForeignKey
ALTER TABLE "avances" ADD CONSTRAINT "avances_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avance_items" ADD CONSTRAINT "avance_items_avance_id_fkey" FOREIGN KEY ("avance_id") REFERENCES "avances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avance_items" ADD CONSTRAINT "avance_items_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
