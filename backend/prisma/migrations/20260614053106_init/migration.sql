-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('QUOTE_CREATED', 'QUOTE_EXPIRED', 'QUOTE_USED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('WAITING_USDT', 'USDT_DETECTED', 'USDT_CONFIRMED', 'UNDERPAID', 'OVERPAID', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PAYOUT_PENDING', 'PAYOUT_PROCESSING', 'PAYOUT_SUCCESS', 'PAYOUT_FAILED');

-- CreateEnum
CREATE TYPE "FinalStatus" AS ENUM ('SUCCESS', 'FAILED', 'REFUND_REQUIRED', 'CANCELLED', 'MANUAL_REVIEW');

-- CreateEnum
CREATE TYPE "BlockchainTxStatus" AS ENUM ('DETECTED', 'CONFIRMED', 'FAILED', 'IGNORED');

-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('SETTLEMENT', 'TREASURY', 'COLD', 'HOT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" VARCHAR(255),
    "country" VARCHAR(100),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "pin_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "device_id" VARCHAR(255),
    "device_name" VARCHAR(255),
    "ip_address" VARCHAR(100),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_quotes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "merchant_bank_code" VARCHAR(50),
    "merchant_bank_name" VARCHAR(255),
    "merchant_account_number" VARCHAR(100),
    "merchant_account_name" VARCHAR(255),
    "amount_vnd" DECIMAL(18,2) NOT NULL,
    "rate_usdt_vnd" DECIMAL(18,6) NOT NULL,
    "service_fee_usdt" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "network_fee_usdt" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "total_usdt" DECIMAL(18,6) NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'QUOTE_CREATED',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_orders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "quote_id" UUID NOT NULL,
    "order_code" VARCHAR(100) NOT NULL,
    "amount_vnd" DECIMAL(18,2) NOT NULL,
    "required_usdt" DECIMAL(18,6) NOT NULL,
    "received_usdt" DECIMAL(18,6) DEFAULT 0,
    "merchant_bank_code" VARCHAR(50),
    "merchant_bank_name" VARCHAR(255),
    "merchant_account_number" VARCHAR(100),
    "merchant_account_name" VARCHAR(255),
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'WAITING_USDT',
    "payout_status" "PayoutStatus",
    "final_status" "FinalStatus",
    "expires_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_transactions" (
    "id" UUID NOT NULL,
    "payment_order_id" UUID,
    "network" VARCHAR(50) NOT NULL,
    "token_symbol" VARCHAR(50) NOT NULL,
    "tx_hash" VARCHAR(255) NOT NULL,
    "from_address" VARCHAR(255),
    "to_address" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(18,6) NOT NULL,
    "block_number" BIGINT,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "status" "BlockchainTxStatus" NOT NULL DEFAULT 'DETECTED',
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),
    "raw_payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blockchain_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_wallets" (
    "id" UUID NOT NULL,
    "network" VARCHAR(50) NOT NULL,
    "token_symbol" VARCHAR(50) NOT NULL,
    "wallet_address" VARCHAR(255) NOT NULL,
    "wallet_type" "WalletType" NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_transactions" (
    "id" UUID NOT NULL,
    "payment_order_id" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "provider_reference" VARCHAR(255),
    "bank_code" VARCHAR(50) NOT NULL,
    "bank_name" VARCHAR(255),
    "account_number" VARCHAR(100) NOT NULL,
    "account_name" VARCHAR(255),
    "amount_vnd" DECIMAL(18,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PAYOUT_PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "error_code" VARCHAR(100),
    "error_message" TEXT,
    "requested_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "raw_request" JSONB,
    "raw_response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_snapshots" (
    "id" UUID NOT NULL,
    "base_currency" VARCHAR(20) NOT NULL,
    "quote_currency" VARCHAR(20) NOT NULL,
    "rate" DECIMAL(18,6) NOT NULL,
    "provider" VARCHAR(100) NOT NULL,
    "source_payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_type" VARCHAR(50) NOT NULL,
    "actor_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(100),
    "entity_id" UUID,
    "metadata" JSONB,
    "ip_address" VARCHAR(100),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "payment_quotes_user_id_idx" ON "payment_quotes"("user_id");

-- CreateIndex
CREATE INDEX "payment_quotes_status_idx" ON "payment_quotes"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_orders_quote_id_key" ON "payment_orders"("quote_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_orders_order_code_key" ON "payment_orders"("order_code");

-- CreateIndex
CREATE INDEX "payment_orders_user_id_idx" ON "payment_orders"("user_id");

-- CreateIndex
CREATE INDEX "payment_orders_order_code_idx" ON "payment_orders"("order_code");

-- CreateIndex
CREATE INDEX "payment_orders_payment_status_idx" ON "payment_orders"("payment_status");

-- CreateIndex
CREATE INDEX "payment_orders_final_status_idx" ON "payment_orders"("final_status");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_transactions_tx_hash_key" ON "blockchain_transactions"("tx_hash");

-- CreateIndex
CREATE INDEX "blockchain_transactions_tx_hash_idx" ON "blockchain_transactions"("tx_hash");

-- CreateIndex
CREATE INDEX "blockchain_transactions_payment_order_id_idx" ON "blockchain_transactions"("payment_order_id");

-- CreateIndex
CREATE INDEX "payout_transactions_payment_order_id_idx" ON "payout_transactions"("payment_order_id");

-- CreateIndex
CREATE INDEX "payout_transactions_status_idx" ON "payout_transactions"("status");

-- CreateIndex
CREATE INDEX "audit_logs_actor_type_actor_id_idx" ON "audit_logs"("actor_type", "actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_quotes" ADD CONSTRAINT "payment_quotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "payment_quotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_transactions" ADD CONSTRAINT "blockchain_transactions_payment_order_id_fkey" FOREIGN KEY ("payment_order_id") REFERENCES "payment_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_transactions" ADD CONSTRAINT "payout_transactions_payment_order_id_fkey" FOREIGN KEY ("payment_order_id") REFERENCES "payment_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
