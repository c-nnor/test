/*
  Warnings:

  - You are about to drop the column `storeId` on the `TravelPathReport` table. All the data in the column will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `DA_Report` to the `TravelPathReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DT_Report` to the `TravelPathReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `FC_Report` to the `TravelPathReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `KA_Report` to the `TravelPathReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `R_Report` to the `TravelPathReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `SR_Report` to the `TravelPathReport` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_travelPathReportId_fkey";

-- AlterTable
ALTER TABLE "TravelPathReport" DROP COLUMN "storeId",
ADD COLUMN     "DA_Report" TEXT NOT NULL,
ADD COLUMN     "DT_Report" TEXT NOT NULL,
ADD COLUMN     "FC_Report" TEXT NOT NULL,
ADD COLUMN     "KA_Report" TEXT NOT NULL,
ADD COLUMN     "R_Report" TEXT NOT NULL,
ADD COLUMN     "SR_Report" TEXT NOT NULL;

-- DropTable
DROP TABLE "Location";
