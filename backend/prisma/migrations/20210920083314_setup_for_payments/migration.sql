/*
  Warnings:

  - Added the required column `creatorId` to the `UploadJob` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_uploadJobId_fkey";

-- AlterTable
ALTER TABLE "Image" ALTER COLUMN "uploadJobId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UploadJob" ADD COLUMN     "creatorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "amount" INTEGER,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "discount" INTEGER;

-- CreateTable
CREATE TABLE "Following" (
    "followerId" TEXT NOT NULL,
    "followeeId" TEXT NOT NULL,
    "paid" BOOLEAN NOT NULL,

    CONSTRAINT "Following_pkey" PRIMARY KEY ("followerId","followeeId")
);

-- AddForeignKey
ALTER TABLE "Following" ADD CONSTRAINT "Following_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Following" ADD CONSTRAINT "Following_followeeId_fkey" FOREIGN KEY ("followeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_uploadJobId_fkey" FOREIGN KEY ("uploadJobId") REFERENCES "UploadJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadJob" ADD CONSTRAINT "UploadJob_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
