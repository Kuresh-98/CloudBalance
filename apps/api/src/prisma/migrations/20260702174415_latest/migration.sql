-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "monthly_budget" DECIMAL(12,2),
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resource_uid" TEXT NOT NULL,
    "team_id" UUID,
    "service" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "instance_type" TEXT,
    "status" TEXT NOT NULL,
    "tags" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resource_id" UUID,
    "date" DATE NOT NULL,
    "avg_cpu_util" DECIMAL(5,2),
    "avg_mem_util" DECIMAL(5,2),
    "network_in_gb" DECIMAL(10,2),
    "network_out_gb" DECIMAL(10,2),

    CONSTRAINT "usage_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resource_id" UUID,
    "date" DATE NOT NULL,
    "usage_quantity" DECIMAL(12,4),
    "unblended_cost" DECIMAL(12,4) NOT NULL,
    "currency" TEXT DEFAULT 'USD',

    CONSTRAINT "cost_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resource_id" UUID,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "estimated_monthly_savings" DECIMAL(12,2) NOT NULL,
    "confidence" TEXT NOT NULL,
    "status" TEXT DEFAULT 'open',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_usage_metrics_resource_date" ON "usage_metrics"("resource_id", "date");

-- CreateIndex
CREATE INDEX "idx_cost_records_resource_date" ON "cost_records"("resource_id", "date");

-- CreateIndex
CREATE INDEX "idx_recommendations_status" ON "recommendations"("status");

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_metrics" ADD CONSTRAINT "usage_metrics_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_records" ADD CONSTRAINT "cost_records_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
