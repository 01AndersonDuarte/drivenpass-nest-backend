-- CreateTable
CREATE TABLE "credentials" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credentials_title_key" ON "credentials"("title");

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
