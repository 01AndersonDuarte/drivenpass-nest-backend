/*
  Warnings:

  - A unique constraint covering the columns `[title,userId]` on the table `credentials` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('CREDIT', 'DEBIT', 'BOTH');

-- CreateTable
CREATE TABLE "notes" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "password" TEXT NOT NULL,
    "virtual" BOOLEAN NOT NULL,
    "type" "CardType" NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notes_title_key" ON "notes"("title");

-- CreateIndex
CREATE UNIQUE INDEX "notes_title_userId_key" ON "notes"("title", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "cards_title_key" ON "cards"("title");

-- CreateIndex
CREATE UNIQUE INDEX "cards_title_userId_key" ON "cards"("title", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "credentials_title_userId_key" ON "credentials"("title", "userId");

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
