/*
  Warnings:

  - Added the required column `deposit_address` to the `payment_orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment_orders" ADD COLUMN     "deposit_address" VARCHAR(255) NOT NULL;
