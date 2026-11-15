-- AstroVitals Tiger Data Extensions Initialization
-- This runs automatically on first PostgreSQL container start

-- Enable TimescaleDB for time-series hypertables
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Enable pgvector for embedding similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
