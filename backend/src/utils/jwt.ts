import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JwtPayload } from '../types';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_123';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_456';

const ACCESS_EXPIRES_IN = (process.env.ACCESS_TOKEN_EXPIRES_IN || '1h') as jwt.SignOptions['expiresIn'];
const REFRESH_EXPIRES_IN = (process.env.REFRESH_TOKEN_EXPIRES_IN || '6h') as jwt.SignOptions['expiresIn'];

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
};
