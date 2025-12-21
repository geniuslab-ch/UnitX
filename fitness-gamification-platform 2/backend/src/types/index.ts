// Type definitions for the fitness gamification platform

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BRAND_ADMIN = 'BRAND_ADMIN',
  CLUB_ADMIN = 'CLUB_ADMIN',
  MEMBER = 'MEMBER',
}

export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum SeasonScope {
  INTERCLUB_OPEN = 'INTERCLUB_OPEN',
  INTRABRAND = 'INTRABRAND',
  CUSTOM_MATCH = 'CUSTOM_MATCH',
}

export enum SeasonStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum LeagueTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
}

export enum CheckInMethod {
  QR = 'QR',
  KIOSK = 'KIOSK',
  MANUAL = 'MANUAL',
}

export enum HealthDataSource {
  HEALTHKIT = 'HEALTHKIT',
  HEALTH_CONNECT = 'HEALTH_CONNECT',
  MANUAL = 'MANUAL',
}

export enum AuthProvider {
  EMAIL = 'EMAIL',
  APPLE = 'APPLE',
  GOOGLE = 'GOOGLE',
}

// ============================================================================
// ENTITIES
// ============================================================================

export interface Brand {
  id: string;
  name: string;
  country?: string;
  logo_url?: string;
  primary_color?: string;
  status: EntityStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Club {
  id: string;
  brand_id?: string;
  external_club_id?: string;
  name: string;
  city?: string;
  address?: string;
  timezone: string;
  qr_token_secret: string;
  qr_last_rotation: Date;
  status: EntityStatus;
  created_at: Date;
  updated_at: Date;
}

export interface UserAuth {
  id: string;
  email?: string;
  phone?: string;
  password_hash?: string;
  provider: AuthProvider;
  provider_id?: string;
  role: UserRole;
  status: EntityStatus;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Member {
  id: string;
  user_auth_id?: string;
  club_id?: string;
  brand_id?: string;
  external_member_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  health_consent_granted: boolean;
  health_consent_date?: Date;
  status: EntityStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Ruleset {
  id: string;
  name: string;
  params: RulesetParams;
  created_at: Date;
}

export interface RulesetParams {
  checkinPoints: number;
  caloriePointsDivisor: number;
  maxCaloriePointsPerDay: number;
  streakBonusPoints: number;
  streakDaysRequired: number;
  topNContributors: number;
  maxCaloriesPerDay: number;
  maxCaloriesSpike30Min: number;
}

export interface Season {
  id: string;
  brand_id?: string;
  name: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  scope: SeasonScope;
  ruleset_id?: string;
  status: SeasonStatus;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SeasonClub {
  season_id: string;
  club_id: string;
  league_tier: LeagueTier;
  joined_at: Date;
}

export interface HealthDailySummary {
  id: string;
  member_id: string;
  date: Date;
  active_calories: number;
  steps: number;
  workout_minutes: number;
  source: HealthDataSource;
  device_info?: any;
  last_sync_at: Date;
  anomaly_flag: boolean;
  anomaly_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CheckIn {
  id: string;
  member_id: string;
  club_id: string;
  timestamp: Date;
  method: CheckInMethod;
  qr_token?: string;
  device_info?: any;
  created_at: Date;
}

export interface MemberScoreDaily {
  id: string;
  member_id: string;
  date: Date;
  points_checkin: number;
  points_calories: number;
  points_bonus: number;
  total_points: number;
  streak_days: number;
  calculated_at: Date;
}

export interface ClubScoreDaily {
  id: string;
  club_id: string;
  season_id: string;
  date: Date;
  total_points: number;
  contributors_count: number;
  top_n_used: number;
  calculated_at: Date;
}

export interface LeagueStanding {
  id: string;
  season_id: string;
  club_id: string;
  week_start_date: Date;
  tier: LeagueTier;
  rank: number;
  points: number;
  promotion: boolean;
  demotion: boolean;
  calculated_at: Date;
}

export interface AuditLog {
  id: string;
  user_auth_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// ============================================================================
// REQUEST/RESPONSE DTOs
// ============================================================================

export interface SignupRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  club_code?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: {
    id: string;
    email?: string;
    role: UserRole;
    member_id?: string;
  };
}

export interface HealthSyncRequest {
  date: string; // YYYY-MM-DD
  active_calories: number;
  steps?: number;
  workout_minutes?: number;
  source: HealthDataSource;
  timezone: string;
  device_info?: any;
}

export interface CheckInRequest {
  club_id: string;
  qr_token: string;
}

export interface CreateSeasonRequest {
  brand_id?: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  scope: SeasonScope;
  ruleset_params?: Partial<RulesetParams>;
  invited_club_ids?: string[];
}

export interface LeaderboardQuery {
  season_id?: string;
  club_id?: string;
  week?: string; // YYYY-MM-DD (Monday)
  tier?: LeagueTier;
  limit?: number;
}

export interface MemberScoreResponse {
  member_id: string;
  date: string;
  points: {
    checkin: number;
    calories: number;
    bonus: number;
    total: number;
  };
  streak_days: number;
  rank?: number;
}

export interface ClubLeaderboardEntry {
  club_id: string;
  club_name: string;
  tier: LeagueTier;
  rank: number;
  points: number;
  contributors: number;
  promotion: boolean;
  demotion: boolean;
}

// ============================================================================
// JWT PAYLOAD
// ============================================================================

export interface JWTPayload {
  user_id: string;
  role: UserRole;
  member_id?: string;
  iat?: number;
  exp?: number;
}

// ============================================================================
// CSV IMPORT
// ============================================================================

export interface ClubImportRow {
  external_club_id: string;
  name: string;
  city?: string;
  timezone?: string;
  brand?: string;
}

export interface MemberImportRow {
  external_member_id: string;
  external_club_id: string;
  first_name: string;
  last_name: string;
  email?: string;
}
