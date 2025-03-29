-- CreateTable
CREATE TABLE "TravelPathReport" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "storeId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelPathReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "travelPathReportId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "scanned" BOOLEAN NOT NULL,
    "scanTime" TIMESTAMP(3),
    "issues" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TravelPathReport" ADD CONSTRAINT "TravelPathReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_travelPathReportId_fkey" FOREIGN KEY ("travelPathReportId") REFERENCES "TravelPathReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
