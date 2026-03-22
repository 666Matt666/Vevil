import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PendingRegistrationsService } from "@/pending-registrations/pending-registrations.service";
import { UsersService } from "@/users/users.service";
import { AuditService } from "@/audit/audit.service";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = {
    id: "1",
    email: "test@test.com",
    name: "Test",
    role: "user",
    isActive: true,
  };

  const mockAuthService = {
    login: jest.fn().mockResolvedValue({
      access_token: "access_token",
      refresh_token: "refresh_token",
      user: mockUser,
    }),
    register: jest.fn().mockResolvedValue(mockUser),
    logout: jest.fn().mockResolvedValue(undefined),
    refreshTokens: jest.fn().mockResolvedValue({
      access_token: "new_access_token",
      refresh_token: "new_refresh_token",
      user: mockUser,
    }),
    forgotPassword: jest.fn().mockResolvedValue({ message: "Email sent" }),
    resetPassword: jest.fn().mockResolvedValue({ message: "Password reset" }),
    changePassword: jest.fn().mockResolvedValue({ message: "Password changed" }),
  };

  const mockPendingRegistrationsService = {
    createRequest: jest.fn().mockResolvedValue({}),
    confirmEmail: jest.fn().mockResolvedValue({}),
  };

  const mockUsersService = {
    findOne: jest.fn().mockResolvedValue(mockUser),
    findOneByEmail: jest.fn().mockResolvedValue(mockUser),
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PendingRegistrationsService, useValue: mockPendingRegistrationsService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    it("should call authService.register", async () => {
      const dto = { email: "test@test.com", name: "Test", password: "password123" };
      const result = await controller.register(dto);
      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe("forgotPassword", () => {
    it("should call authService.forgotPassword", async () => {
      const dto = { email: "test@test.com" };
      const result = await controller.forgotPassword(dto);
      expect(authService.forgotPassword).toHaveBeenCalledWith(dto.email);
      expect(result).toEqual({ message: "Email sent" });
    });
  });

  describe("resetPassword", () => {
    it("should call authService.resetPassword", async () => {
      const dto = { token: "token", newPassword: "newpass123" };
      const result = await controller.resetPassword(dto);
      expect(authService.resetPassword).toHaveBeenCalledWith(dto.token, dto.newPassword);
      expect(result).toEqual({ message: "Password reset" });
    });
  });

  describe("changePassword", () => {
    it("should call authService.changePassword", async () => {
      const user = { ...mockUser, id: "1" };
      const dto = { currentPassword: "oldpass", newPassword: "newpass123" };
      const result = await controller.changePassword(user, dto);
      expect(authService.changePassword).toHaveBeenCalledWith("1", dto.currentPassword, dto.newPassword);
      expect(result).toEqual({ message: "Password changed" });
    });
  });

  describe("getProfile", () => {
    it("should return user profile without sensitive data", async () => {
      const user = { ...mockUser, id: "1" };
      const result = await controller.getProfile(user);
      expect(mockUsersService.findOne).toHaveBeenCalledWith("1");
      expect(result.password).toBeUndefined();
      expect(result.hashedRefreshToken).toBeUndefined();
    });
  });
});
