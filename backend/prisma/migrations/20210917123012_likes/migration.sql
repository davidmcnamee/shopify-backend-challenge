-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "likedByIds" TEXT[],
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "_LikedImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LikedImages_AB_unique" ON "_LikedImages"("A", "B");

-- CreateIndex
CREATE INDEX "_LikedImages_B_index" ON "_LikedImages"("B");

-- AddForeignKey
ALTER TABLE "_LikedImages" ADD FOREIGN KEY ("A") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LikedImages" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
