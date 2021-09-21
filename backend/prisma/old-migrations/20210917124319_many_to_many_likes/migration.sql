/*
  Warnings:

  - You are about to drop the column `likes` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the `_LikedImages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_LikedImages" DROP CONSTRAINT "_LikedImages_A_fkey";

-- DropForeignKey
ALTER TABLE "_LikedImages" DROP CONSTRAINT "_LikedImages_B_fkey";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "likes";

-- DropTable
DROP TABLE "_LikedImages";

-- CreateTable
CREATE TABLE "Likes" (
    "userId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("userId","imageId")
);

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
