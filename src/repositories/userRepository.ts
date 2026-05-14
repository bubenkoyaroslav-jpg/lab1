import { UserRole } from "../dtos/userDtos";

export interface UserModel {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface UserCreateData {
  name: string;
  email: string;
  role: UserRole;
}

interface UserPatchData {
  name?: string;
  email?: string;
  role?: UserRole;
}

class UserRepository {
  private users: UserModel[] = [];
  private nextId = 1;

  public getAll(): UserModel[] {
    return [...this.users];
  }

  public getById(id: number): UserModel | undefined {
    return this.users.find((user) => user.id === id);
  }

  public create(data: UserCreateData): UserModel {
    const newUser: UserModel = {
      id: this.nextId,
      name: data.name,
      email: data.email,
      role: data.role,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.nextId += 1;

    return newUser;
  }

  public replace(id: number, data: UserCreateData): UserModel | null {
    const index = this.users.findIndex((user) => user.id === id);

    if (index === -1) {
      return null;
    }

    const existingUser = this.users[index];

    const updatedUser: UserModel = {
      id: existingUser.id,
      name: data.name,
      email: data.email,
      role: data.role,
      createdAt: existingUser.createdAt
    };

    this.users[index] = updatedUser;

    return updatedUser;
  }

  public patch(id: number, data: UserPatchData): UserModel | null {
    const index = this.users.findIndex((user) => user.id === id);

    if (index === -1) {
      return null;
    }

    const existingUser = this.users[index];

    const updatedUser: UserModel = {
      ...existingUser,
      ...data
    };

    this.users[index] = updatedUser;

    return updatedUser;
  }

  public delete(id: number): boolean {
    const oldLength = this.users.length;
    this.users = this.users.filter((user) => user.id !== id);
    return this.users.length < oldLength;
  }
}

export const userRepository = new UserRepository();
