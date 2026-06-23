-- DropForeignKey
ALTER TABLE "Movement" DROP CONSTRAINT "Movement_userId_fkey";

-- AlterTable
ALTER TABLE "Movement" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
