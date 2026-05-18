-- Kaamlink AI Service Orchestrator — Supabase Schema
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/kawqktwowimbgonldaeu/sql/new

-- ── providers table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.providers (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              TEXT NOT NULL,
    services          TEXT[] NOT NULL DEFAULT '{}',
    rating            NUMERIC(3,1) NOT NULL DEFAULT 4.0,
    cancellation_rate NUMERIC(4,2) NOT NULL DEFAULT 0.05,
    base_price        INTEGER NOT NULL DEFAULT 1500,
    location          TEXT NOT NULL DEFAULT 'Unknown',
    availability_slots TEXT[] NOT NULL DEFAULT '{"morning","afternoon"}',
    review_recency_days INTEGER NOT NULL DEFAULT 20,
    on_time_score      NUMERIC(4,2) NOT NULL DEFAULT 0.85,
    capacity_available INTEGER NOT NULL DEFAULT 3,
    risk_score         NUMERIC(4,2) NOT NULL DEFAULT 0.20,
    specialization_score NUMERIC(4,2) NOT NULL DEFAULT 0.80,
    workload_score     NUMERIC(4,2) NOT NULL DEFAULT 0.50,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── agent_logs table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name  TEXT NOT NULL,
    decision    TEXT NOT NULL,
    reasoning   TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── bookings table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT NOT NULL,
    provider_id UUID NOT NULL REFERENCES public.providers(id),
    service     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'confirmed',
    scheduled_slot TEXT,
    location TEXT,
    cancelled_by TEXT,
    replacement_for UUID,
    recovery_attempts INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id TEXT NOT NULL,
    recipient TEXT NOT NULL,
    channel TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    checklist TEXT[] NOT NULL DEFAULT '{}',
    evidence_placeholders TEXT[] NOT NULL DEFAULT '{}',
    rating NUMERIC(3,1) NOT NULL,
    review TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    requested_resolution TEXT,
    resolution TEXT,
    provider_penalty TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orchestration_traces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step TEXT NOT NULL,
    agent TEXT NOT NULL,
    decision TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    ts TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Enable Row Level Security (open read for hackathon demo) ─────────────────
ALTER TABLE public.providers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orchestration_traces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON public.providers   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.agent_logs  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.bookings    FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.notifications FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.service_reports FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.disputes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.orchestration_traces FOR ALL TO anon USING (true) WITH CHECK (true);
