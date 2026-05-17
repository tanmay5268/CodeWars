-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('credentials', 'google', 'github');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "provider" "Provider" DEFAULT 'credentials',
ALTER COLUMN "password" DROP NOT NULL;
