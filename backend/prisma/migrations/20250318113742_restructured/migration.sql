/*
  Warnings:

  - You are about to drop the column `DA_Report` on the `TravelPathReport` table. All the data in the column will be lost.
  - You are about to drop the column `DT_Report` on the `TravelPathReport` table. All the data in the column will be lost.
  - You are about to drop the column `FC_Report` on the `TravelPathReport` table. All the data in the column will be lost.
  - You are about to drop the column `KA_Report` on the `TravelPathReport` table. All the data in the column will be lost.
  - You are about to drop the column `R_Report` on the `TravelPathReport` table. All the data in the column will be lost.
  - You are about to drop the column `SR_Report` on the `TravelPathReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TravelPathReport" DROP COLUMN "DA_Report",
DROP COLUMN "DT_Report",
DROP COLUMN "FC_Report",
DROP COLUMN "KA_Report",
DROP COLUMN "R_Report",
DROP COLUMN "SR_Report";

-- CreateTable
CREATE TABLE "LocationCheck" (
    "id" SERIAL NOT NULL,
    "travelPathReportId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LocationCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckItem" (
    "id" SERIAL NOT NULL,
    "locationCheckId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "result" BOOLEAN NOT NULL,
    "action" TEXT,

    CONSTRAINT "CheckItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LocationCheck" ADD CONSTRAINT "LocationCheck_travelPathReportId_fkey" FOREIGN KEY ("travelPathReportId") REFERENCES "TravelPathReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckItem" ADD CONSTRAINT "CheckItem_locationCheckId_fkey" FOREIGN KEY ("locationCheckId") REFERENCES "LocationCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
