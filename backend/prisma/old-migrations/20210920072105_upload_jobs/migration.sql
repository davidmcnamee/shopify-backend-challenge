/*
  Warnings:

  - Added the required column `uploadJobId` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "uploadJobId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UploadJob" (
    "id" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL,
    "errors" JSONB NOT NULL DEFAULT E'[]',
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UploadJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_uploadJobId_fkey" FOREIGN KEY ("uploadJobId") REFERENCES "UploadJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
