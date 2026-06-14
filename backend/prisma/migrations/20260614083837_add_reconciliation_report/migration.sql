-- CreateTable
CREATE TABLE "reconciliation_reports" (
    "id" UUID NOT NULL,
    "report_date" DATE NOT NULL,
    "total_orders_count" INTEGER NOT NULL,
    "total_usdt_received" DECIMAL(18,6) NOT NULL,
    "total_vnd_payout" DECIMAL(18,2) NOT NULL,
    "discrepancies_count" INTEGER NOT NULL,
    "discrepancies_details" JSONB,
    "status" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reconciliation_reports_report_date_key" ON "reconciliation_reports"("report_date");
