import bcrypt from 'bcryptjs';
import { User, Role } from '../models';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { FormattedUser } from '../types';

export class AuthService {
  static async login(email: string, pass: string) {
    if (!email || !pass) {
      const error: any = new Error('Email address and password are required');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({
      where: { emailAddress: email },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      const error: any = new Error('Invalid email address or password');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error: any = new Error('User account is inactive. Please contact system administrator.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      const error: any = new Error('Invalid email address or password');
      error.statusCode = 401;
      throw error;
    }

    const roleName = user.role ? user.role.roleName : 'User';

    const payload = {
      userId: user.id,
      roleId: user.roleId,
      email: user.emailAddress,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const formattedUser: FormattedUser = {
      id: user.id,
      email: user.emailAddress,
      name: `${user.firstName} ${user.lastName}`.trim(),
      role: roleName,
    };

    return {
      accessToken,
      refreshToken,
      user: formattedUser,
    };
  }

  static async refreshToken(token: string) {
    if (!token) {
      const error: any = new Error('Refresh token is required');
      error.statusCode = 400;
      throw error;
    }

    try {
      const decoded = verifyRefreshToken(token);

      // Verify user is still active in database
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        const error: any = new Error('User account is inactive or no longer exists');
        error.statusCode = 401;
        throw error;
      }

      const payload = {
        userId: user.id,
        roleId: user.roleId,
        email: user.emailAddress,
      };

      const newAccessToken = generateAccessToken(payload);
      return { accessToken: newAccessToken };
    } catch (err: any) {
      const error: any = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }
  }
}
