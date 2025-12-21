-- Database Schema for Fitness Gamification Platform
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'BRAND_ADMIN', 'CLUB_ADMIN', 'MEMBER');
CREATE TYPE entity_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');
CREATE TYPE season_scope AS ENUM ('INTERCLUB_OPEN', 'INTRABRAND', 'CUSTOM_MATCH');
CREATE TYPE season_status AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE league_tier AS ENUM ('BRONZE', 'SILVER', 'GOLD');
CREATE TYPE checkin_method AS ENUM ('QR', 'KIOSK', 'MANUAL');
CREATE TYPE health_data_source AS ENUM ('HEALTHKIT', 'HEALTH_CONNECT', 'MANUAL');
CREATE TYPE auth_provider AS ENUM ('EMAIL', 'APPLE', 'GOOGLE');

-- ============================================================================
-- CORE ENTITIES
-- ============================================================================

-- Brands (Chains)
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(2), -- ISO 3166-1 alpha-2
    logo_url TEXT,
    primary_color VARCHAR(7),
    status entity_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_brands_status ON brands(status);

-- Clubs (Individual gyms)
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    external_club_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    address TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC', -- IANA timezone
    qr_token_secret VARCHAR(255) NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    qr_last_rotation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status entity_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(brand_id, external_club_id)
);

CREATE INDEX idx_clubs_brand ON clubs(brand_id);
CREATE INDEX idx_clubs_status ON clubs(status);
CREATE INDEX idx_clubs_external_id ON clubs(external_club_id);

-- User Authentication
CREATE TABLE user_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255),
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    provider auth_provider DEFAULT 'EMAIL',
    provider_id VARCHAR(255), -- Apple/Google user ID
    role user_role DEFAULT 'MEMBER',
    status entity_status DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email),
    UNIQUE(provider, provider_id)
);

CREATE INDEX idx_user_auth_email ON user_auth(email);
CREATE INDEX idx_user_auth_provider ON user_auth(provider, provider_id);

-- Members (Athletes)
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_auth_id UUID REFERENCES user_auth(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    external_member_id VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    avatar_url TEXT,
    health_consent_granted BOOLEAN DEFAULT FALSE,
    health_consent_date TIMESTAMP WITH TIME ZONE,
    status entity_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_members_club ON members(club_id);
CREATE INDEX idx_members_brand ON members(brand_id);
CREATE INDEX idx_members_user_auth ON members(user_auth_id);
CREATE INDEX idx_members_external_id ON members(external_member_id);
CREATE INDEX idx_members_status ON members(status);

-- ============================================================================
-- SEASONS & LEAGUES
-- ============================================================================

-- Rulesets (Scoring configuration)
CREATE TABLE rulesets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    params JSONB NOT NULL DEFAULT '{
        "checkinPoints": 50,
        "caloriePointsDivisor": 10,
        "maxCaloriePointsPerDay": 150,
        "streakBonusPoints": 20,
        "streakDaysRequired": 3,
        "topNContributors": 50,
        "maxCaloriesPerDay": 2500,
        "maxCaloriesSpike30Min": 1000
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default ruleset
INSERT INTO rulesets (name) VALUES ('Default MVP Rules');

-- Seasons
CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    scope season_scope DEFAULT 'INTERCLUB_OPEN',
    ruleset_id UUID REFERENCES rulesets(id) ON DELETE SET NULL,
    status season_status DEFAULT 'DRAFT',
    created_by UUID REFERENCES user_auth(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (end_date > start_date)
);

CREATE INDEX idx_seasons_brand ON seasons(brand_id);
CREATE INDEX idx_seasons_dates ON seasons(start_date, end_date);
CREATE INDEX idx_seasons_status ON seasons(status);

-- Season Clubs (Participation)
CREATE TABLE season_clubs (
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    league_tier league_tier DEFAULT 'BRONZE',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (season_id, club_id)
);

CREATE INDEX idx_season_clubs_season ON season_clubs(season_id);
CREATE INDEX idx_season_clubs_club ON season_clubs(club_id);

-- ============================================================================
-- HEALTH & CHECK-INS
-- ============================================================================

-- Health Daily Summary
CREATE TABLE health_daily_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    active_calories INTEGER DEFAULT 0,
    steps INTEGER DEFAULT 0,
    workout_minutes INTEGER DEFAULT 0,
    source health_data_source DEFAULT 'HEALTHKIT',
    device_info JSONB,
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    anomaly_flag BOOLEAN DEFAULT FALSE,
    anomaly_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, date)
);

CREATE INDEX idx_health_member_date ON health_daily_summary(member_id, date DESC);
CREATE INDEX idx_health_date ON health_daily_summary(date);
CREATE INDEX idx_health_anomaly ON health_daily_summary(anomaly_flag) WHERE anomaly_flag = TRUE;

-- Check-ins
CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    method checkin_method DEFAULT 'QR',
    qr_token VARCHAR(255),
    device_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_checkins_member ON checkins(member_id, timestamp DESC);
CREATE INDEX idx_checkins_club ON checkins(club_id, timestamp DESC);
CREATE INDEX idx_checkins_date ON checkins(DATE(timestamp));

-- ============================================================================
-- SCORING
-- ============================================================================

-- Member Score Daily
CREATE TABLE member_score_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    points_checkin INTEGER DEFAULT 0,
    points_calories INTEGER DEFAULT 0,
    points_bonus INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, date)
);

CREATE INDEX idx_member_score_member_date ON member_score_daily(member_id, date DESC);
CREATE INDEX idx_member_score_date ON member_score_daily(date);

-- Club Score Daily
CREATE TABLE club_score_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_points INTEGER DEFAULT 0,
    contributors_count INTEGER DEFAULT 0,
    top_n_used INTEGER DEFAULT 50,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(club_id, season_id, date)
);

CREATE INDEX idx_club_score_club_date ON club_score_daily(club_id, season_id, date DESC);
CREATE INDEX idx_club_score_season ON club_score_daily(season_id, date);

-- League Standings (Weekly)
CREATE TABLE league_standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    tier league_tier NOT NULL,
    rank INTEGER NOT NULL,
    points INTEGER DEFAULT 0,
    promotion BOOLEAN DEFAULT FALSE,
    demotion BOOLEAN DEFAULT FALSE,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(season_id, club_id, week_start_date)
);

CREATE INDEX idx_standings_season_week ON league_standings(season_id, week_start_date, tier, rank);
CREATE INDEX idx_standings_club ON league_standings(club_id, week_start_date DESC);

-- ============================================================================
-- AUDIT & LOGS
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_auth_id UUID REFERENCES user_auth(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_auth_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_auth_updated_at BEFORE UPDATE ON user_auth
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_updated_at BEFORE UPDATE ON health_daily_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS (HELPERS)
-- ============================================================================

-- Active members per club
CREATE VIEW club_active_members AS
SELECT 
    club_id,
    COUNT(*) as active_count
FROM members
WHERE status = 'ACTIVE'
GROUP BY club_id;

-- Weekly points by club
CREATE VIEW club_weekly_points AS
SELECT 
    csd.club_id,
    csd.season_id,
    DATE_TRUNC('week', csd.date) as week_start,
    SUM(csd.total_points) as weekly_points,
    SUM(csd.contributors_count) as total_contributors
FROM club_score_daily csd
GROUP BY csd.club_id, csd.season_id, DATE_TRUNC('week', csd.date);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create super admin user (change password in production!)
INSERT INTO user_auth (email, password_hash, role, status)
VALUES ('admin@platform.com', '$2b$10$YourHashedPasswordHere', 'SUPER_ADMIN', 'ACTIVE');

