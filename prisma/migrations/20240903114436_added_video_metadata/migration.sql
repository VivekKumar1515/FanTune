-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "largeImage" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "smallImage" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';
