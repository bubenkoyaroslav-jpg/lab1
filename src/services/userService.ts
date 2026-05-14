import {
  CreateUserRequestDto,
  PatchUserRequestDto,
  UpdateUserRequestDto,
  USER_ROLES,
  UserResponseDto,
  UserRole
} from "../dtos/userDtos";
import { UserModel, userRepository } from "../repositories/userRepository";
import { createNotFoundError, createValidationError } from "../utils/errors";
import {
  ValidationDetail,
  clamp,
  isEnumValue,
  isNonEmptyString,
  isObject,
  parsePositiveIntOrDefault
} from "../utils/validation";

type UserSortBy = "id" | "name" | "email" | "createdAt";
type SortDir = "asc" | "desc";

const USER_SORT_FIELDS: UserSortBy[] = ["id", "name", "email", "createdAt"];

export interface UserListQuery {
  name?: string;
  role?: string;
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortDir?: string;
}

export interface UserListResult {
  items: UserResponseDto[];
  page: number;
  pageSize: number;
  total: number;
}

class UserService {
  public getAll(query: UserListQuery): UserListResult {
    const page = parsePositiveIntOrDefault(query.page, 1);
    const pageSize = clamp(parsePositiveIntOrDefault(query.pageSize, 10), 1, 100);

    let users = userRepository.getAll();

    if (query.name && query.name.trim() !== "") {
      const searchName = query.name.trim().toLowerCase();
      users = users.filter((user) => user.name.toLowerCase().includes(searchName));
    }

    if (query.role && isEnumValue(query.role, USER_ROLES)) {
      users = users.filter((user) => user.role === query.role);
    }

    const sortBy: UserSortBy =
      query.sortBy && USER_SORT_FIELDS.includes(query.sortBy as UserSortBy)
        ? (query.sortBy as UserSortBy)
        : "id";

    const sortDir: SortDir = query.sortDir === "asc" ? "asc" : "desc";

    users.sort((a, b) => this.compareUsers(a, b, sortBy, sortDir));

    const total = users.length;
    const start = (page - 1) * pageSize;
    const pagedUsers = users.slice(start, start + pageSize);

    return {
      items: pagedUsers.map((user) => this.toResponseDto(user)),
      page,
      pageSize,
      total
    };
  }

  public getById(id: number): UserResponseDto {
    const user = userRepository.getById(id);

    if (!user) {
      throw createNotFoundError("User not found");
    }

    return this.toResponseDto(user);
  }

  public create(body: unknown): UserResponseDto {
    const dto = this.validateCreateDto(body);
    const createdUser = userRepository.create(dto);
    return this.toResponseDto(createdUser);
  }

  public replace(id: number, body: unknown): UserResponseDto {
    const existingUser = userRepository.getById(id);
    if (!existingUser) {
      throw createNotFoundError("User not found");
    }

    const dto = this.validateUpdateDto(body);
    const updatedUser = userRepository.replace(id, dto);

    if (!updatedUser) {
      throw createNotFoundError("User not found");
    }

    return this.toResponseDto(updatedUser);
  }

  public patch(id: number, body: unknown): UserResponseDto {
    const existingUser = userRepository.getById(id);
    if (!existingUser) {
      throw createNotFoundError("User not found");
    }

    const dto = this.validatePatchDto(body);
    const patchedUser = userRepository.patch(id, dto);

    if (!patchedUser) {
      throw createNotFoundError("User not found");
    }

    return this.toResponseDto(patchedUser);
  }

  public delete(id: number): void {
    const deleted = userRepository.delete(id);
    if (!deleted) {
      throw createNotFoundError("User not found");
    }
  }

  private toResponseDto(user: UserModel): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
  }

  private compareUsers(a: UserModel, b: UserModel, sortBy: UserSortBy, sortDir: SortDir): number {
    let result = 0;

    if (sortBy === "id") {
      result = a.id - b.id;
    } else {
      result = String(a[sortBy]).localeCompare(String(b[sortBy]));
    }

    return sortDir === "asc" ? result : -result;
  }

  private validateCreateDto(body: unknown): CreateUserRequestDto {
    if (!isObject(body)) {
      throw createValidationError([{ field: "body", message: "Body must be an object." }]);
    }

    const details: ValidationDetail[] = [];
    const nameValue = body.name;
    const emailValue = body.email;
    const roleValue = body.role;

    let safeName = "";
    let safeEmail = "";
    let safeRole: UserRole = "User";

    if (!isNonEmptyString(nameValue, 2, 50)) {
      details.push({ field: "name", message: "name is required and must be 2-50 chars." });
    } else {
      safeName = nameValue.trim();
    }

    if (!isNonEmptyString(emailValue, 5, 100)) {
      details.push({ field: "email", message: "email is required and must be 5-100 chars." });
    } else if (!emailValue.includes("@")) {
      details.push({ field: "email", message: "email must contain @ symbol." });
    } else {
      safeEmail = emailValue.trim();
    }

    if (!isEnumValue(roleValue, USER_ROLES)) {
      details.push({
        field: "role",
        message: `role must be one of: ${USER_ROLES.join(", ")}.`
      });
    } else {
      safeRole = roleValue;
    }

    if (details.length > 0) {
      throw createValidationError(details);
    }

    return {
      name: safeName,
      email: safeEmail,
      role: safeRole
    };
  }

  private validateUpdateDto(body: unknown): UpdateUserRequestDto {
    return this.validateCreateDto(body);
  }

  private validatePatchDto(body: unknown): PatchUserRequestDto {
    if (!isObject(body)) {
      throw createValidationError([{ field: "body", message: "Body must be an object." }]);
    }

    const details: ValidationDetail[] = [];
    const patchDto: PatchUserRequestDto = {};

    if (Object.keys(body).length === 0) {
      details.push({ field: "body", message: "At least one field is required for PATCH." });
    }

    if (body.name !== undefined) {
      if (!isNonEmptyString(body.name, 2, 50)) {
        details.push({ field: "name", message: "name must be 2-50 chars." });
      } else {
        patchDto.name = body.name.trim();
      }
    }

    if (body.email !== undefined) {
      if (!isNonEmptyString(body.email, 5, 100)) {
        details.push({ field: "email", message: "email must be 5-100 chars." });
      } else if (!body.email.includes("@")) {
        details.push({ field: "email", message: "email must contain @ symbol." });
      } else {
        patchDto.email = body.email.trim();
      }
    }

    if (body.role !== undefined) {
      if (!isEnumValue(body.role, USER_ROLES)) {
        details.push({
          field: "role",
          message: `role must be one of: ${USER_ROLES.join(", ")}.`
        });
      } else {
        patchDto.role = body.role;
      }
    }

    if (details.length > 0) {
      throw createValidationError(details);
    }

    return patchDto;
  }
}

export const userService = new UserService();
