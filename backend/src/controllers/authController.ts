import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    // Support email_address field as well for contract robustness
    const emailAddress = email || req.body.email_address;
    
    const result = await AuthService.login(emailAddress, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    const result = await AuthService.refreshToken(token);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // Stateless JWT: invalidation handled client side by removing tokens
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
