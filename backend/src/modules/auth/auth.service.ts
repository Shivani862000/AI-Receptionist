import { ConflictException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Business, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

import { UnauthorizedAppException } from "../../common/exceptions/app.exception";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { resolvePermissionsForRole } from "../../common/utils/rbac";
import { PrismaService } from "../../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }]
      }
    });

    if (existingUser) {
      throw new ConflictException({
        message: "User with this email or phone already exists",
        code: "CONFLICT"
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const businessSlug = slugify(`${dto.name}-business`);

    const result = await this.prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          businessName: `${dto.name}'s Business`,
          ownerName: dto.name,
          slug: `${businessSlug}-${Date.now()}`,
          timezone: "Asia/Kolkata"
        }
      });

      const user = await tx.user.create({
        data: {
          fullName: dto.name,
          email: dto.email,
          phone: dto.phone,
          passwordHash
        }
      });

      await tx.businessMembership.create({
        data: {
          businessId: business.id,
          userId: user.id,
          role: UserRole.business_admin,
          isPrimary: true
        }
      });

      return { user, business };
    });

    return {
      message: "Registration successful",
      data: await this.buildAuthPayload(result.user, result.business, UserRole.business_admin)
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        memberships: {
          where: { status: "active" },
          include: { business: true },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedAppException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedAppException("Invalid credentials");
    }

    const membership = user.memberships[0];
    if (!membership) {
      throw new UnauthorizedAppException("No active business membership found");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return {
      message: "Login successful",
      data: await this.buildAuthPayload(user, membership.business, membership.role)
    };
  }

  async me(currentUser: CurrentUserType) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: currentUser.userId }
    });

    return {
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        businessId: currentUser.businessId,
        role: currentUser.role,
        permissions: currentUser.permissions ?? resolvePermissionsForRole(currentUser.role)
      }
    };
  }

  private async buildAuthPayload(user: { id: string; fullName: string; email: string; phone: string }, business: Business, role: UserRole | string) {
    const permissions = resolvePermissionsForRole(role);
    const payload: CurrentUserType = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      businessId: business.id,
      role,
      permissions
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        businessId: business.id,
        role,
        permissions
      }
    };
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
