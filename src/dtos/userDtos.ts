export const USER_ROLES = ["Admin", "Analyst", "User"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface CreateUserRequestDto {
  name: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserRequestDto {
  name: string;
  email: string;
  role: UserRole;
}

export interface PatchUserRequestDto {
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}
