import QRCode from 'qrcode';
import crypto from 'crypto';
import { query } from '../database/connection';
import dayjs from 'dayjs';

/**
 * Service for generating and validating QR codes for check-ins
 */
export class QRService {
  private static readonly ROTATION_MINUTES = parseInt(
    process.env.QR_CODE_ROTATION_MINUTES || '5'
  );
  private static readonly QR_SECRET = process.env.QR_CODE_SECRET || 'default-secret';

  /**
   * Generate QR code for a club
   */
  static async generateClubQRCode(clubId: string): Promise<string> {
    // Get club's secret
    const result = await query(
      `SELECT qr_token_secret, qr_last_rotation FROM clubs WHERE id = $1`,
      [clubId]
    );

    if (result.rows.length === 0) {
      throw new Error('Club not found');
    }

    const club = result.rows[0];
    const lastRotation = dayjs(club.qr_last_rotation);
    const now = dayjs();

    // Check if rotation needed
    if (now.diff(lastRotation, 'minute') >= this.ROTATION_MINUTES) {
      await this.rotateClubSecret(clubId);
      return this.generateClubQRCode(clubId); // Recursive call with new secret
    }

    // Generate token
    const timestamp = Math.floor(Date.now() / 1000);
    const token = this.createToken(clubId, club.qr_token_secret, timestamp);

    // Create QR code data URL
    const qrData = JSON.stringify({
      club_id: clubId,
      token,
      timestamp,
      expires: timestamp + (this.ROTATION_MINUTES * 60),
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrCodeDataUrl;
  }

  /**
   * Validate QR token for check-in
   */
  static async validateQRToken(
    clubId: string,
    token: string,
    timestamp: number
  ): Promise<boolean> {
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    const expiryTime = timestamp + (this.ROTATION_MINUTES * 60);
    
    if (now > expiryTime) {
      throw new Error('QR code expired');
    }

    // Get club secret
    const result = await query(
      `SELECT qr_token_secret FROM clubs WHERE id = $1 AND status = 'ACTIVE'`,
      [clubId]
    );

    if (result.rows.length === 0) {
      throw new Error('Club not found or inactive');
    }

    const club = result.rows[0];

    // Verify token
    const expectedToken = this.createToken(clubId, club.qr_token_secret, timestamp);
    
    return token === expectedToken;
  }

  /**
   * Check in a member using QR code
   */
  static async checkInMember(
    memberId: string,
    clubId: string,
    qrToken: string,
    timestamp: number,
    deviceInfo?: any
  ): Promise<any> {
    // Validate token
    const isValid = await this.validateQRToken(clubId, qrToken, timestamp);
    
    if (!isValid) {
      throw new Error('Invalid QR code');
    }

    // Check if already checked in today
    const today = dayjs().format('YYYY-MM-DD');
    const existingCheckin = await query(
      `SELECT id FROM checkins 
       WHERE member_id = $1 
       AND club_id = $2 
       AND DATE(timestamp) = $3`,
      [memberId, clubId, today]
    );

    if (existingCheckin.rows.length > 0) {
      throw new Error('Already checked in today');
    }

    // Create check-in
    const result = await query(
      `INSERT INTO checkins 
       (member_id, club_id, timestamp, method, qr_token, device_info)
       VALUES ($1, $2, NOW(), 'QR', $3, $4)
       RETURNING *`,
      [memberId, clubId, qrToken, deviceInfo ? JSON.stringify(deviceInfo) : null]
    );

    return result.rows[0];
  }

  /**
   * Rotate club's QR secret
   */
  private static async rotateClubSecret(clubId: string): Promise<void> {
    const newSecret = crypto.randomBytes(32).toString('hex');
    
    await query(
      `UPDATE clubs 
       SET qr_token_secret = $1, qr_last_rotation = NOW() 
       WHERE id = $2`,
      [newSecret, clubId]
    );

    console.log(`🔄 Rotated QR secret for club ${clubId}`);
  }

  /**
   * Create secure token
   */
  private static createToken(
    clubId: string,
    secret: string,
    timestamp: number
  ): string {
    const data = `${clubId}:${timestamp}:${this.QR_SECRET}`;
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
  }

  /**
   * Generate QR code for display (returns SVG)
   */
  static async generateQRCodeSVG(clubId: string): Promise<string> {
    const result = await query(
      `SELECT qr_token_secret FROM clubs WHERE id = $1`,
      [clubId]
    );

    if (result.rows.length === 0) {
      throw new Error('Club not found');
    }

    const club = result.rows[0];
    const timestamp = Math.floor(Date.now() / 1000);
    const token = this.createToken(clubId, club.qr_token_secret, timestamp);

    const qrData = JSON.stringify({
      club_id: clubId,
      token,
      timestamp,
      expires: timestamp + (this.ROTATION_MINUTES * 60),
    });

    return await QRCode.toString(qrData, { type: 'svg' });
  }
}

export default QRService;
