/*
  Warnings:

  - Added the required column `name` to the `Joke` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Joke` ADD COLUMN `name` VARCHAR(191) NOT NULL,
    MODIFY `id` INTEGER NOT NULL;
