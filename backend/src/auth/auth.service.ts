import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import {
  ChangePasswordDto,
  UpdateProfileDto,
} from './dto/update-profile.dto.js';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/forgot-password.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { fullName, email, password, phone, role } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Email is already registered',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        phone,
        role: role ?? 'CUSTOMER',
      },
    });

    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken =
      await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ) {
    const { fullName, email, phone } = updateProfileDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new UnauthorizedException('User not found');
    }

    if (email && email !== existingUser.email) {
      const emailExists =
        await this.prisma.user.findUnique({
          where: { email },
        });

      if (emailExists) {
        throw new ConflictException(
          'Email is already registered',
        );
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName !== undefined && {
          name: fullName,
        }),
        ...(email !== undefined && {
          email,
        }),
        ...(phone !== undefined && {
          phone: phone || null,
        }),
      },
    });

    return {
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ) {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    /*
     * Always return the same response whether the email exists
     * or not. This prevents exposing which emails are registered.
     */
    const response = {
      message:
        'If an account exists with that email, a password reset link has been generated.',
    };

    if (!user) {
      return response;
    }

    /*
     * Remove any existing reset tokens for this user.
     */
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    /*
     * Generate a cryptographically secure random token.
     */
    const rawToken = randomBytes(32).toString('hex');

    /*
     * Store only the hash of the token in the database.
     */
    const tokenHash = createHash('sha256')
      .update(rawToken)
      .digest('hex');

    /*
     * Token expires after 30 minutes.
     */
    const expiresAt = new Date(
      Date.now() + 30 * 60 * 1000,
    );

    await this.prisma.passwordResetToken.create({
      data: {
        token: tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    /*
     * Development reset URL.
     *
     * We will replace this with email delivery later.
     */
    const frontendUrl =
      process.env.FRONTEND_URL ||
      'http://localhost:3001';

    const resetUrl =
      `${frontendUrl}/reset-password` +
      `?email=${encodeURIComponent(user.email)}` +
      `&token=${rawToken}`;

    console.log('');
    console.log('========================================');
    console.log('PASSWORD RESET LINK');
    console.log(resetUrl);
    console.log('========================================');
    console.log('');

    return {
      ...response,
      resetUrl:
        process.env.NODE_ENV !== 'production'
          ? resetUrl
          : undefined,
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ) {
    const {
      email,
      token,
      newPassword,
    } = resetPasswordDto;

    if (!token) {
      throw new UnauthorizedException(
        'Invalid or expired reset link',
      );
    }

    if (newPassword.length < 8) {
      throw new UnauthorizedException(
        'Password must be at least 8 characters',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid or expired reset link',
      );
    }

    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const resetToken =
      await this.prisma.passwordResetToken.findFirst({
        where: {
          token: tokenHash,
          userId: user.id,
        },
      });

    if (
      !resetToken ||
      resetToken.expiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException(
        'Invalid or expired reset link',
      );
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12,
    );

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
        },
      }),

      /*
       * Delete the token immediately so it cannot be reused.
       */
      this.prisma.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      }),

      /*
       * Remove any other reset tokens belonging to
       * this account.
       */
      this.prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
        },
      }),
    ]);

    return {
      message:
        'Password reset successfully. You can now login with your new password.',
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ) {
    const { currentPassword, newPassword } =
      changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException(
        'Current password is incorrect',
      );
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      user.password,
    );

    if (samePassword) {
      throw new ConflictException(
        'New password must be different from your current password',
      );
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: 'Password changed successfully',
    };
  }
}
