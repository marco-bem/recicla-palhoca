export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
}

export interface StoredAuthUser extends AuthUser {
  passwordHash: string;
  isActive: boolean;
}

export interface AuthRepository {
  createUser(fullName: string, email: string, passwordHash: string): Promise<AuthUser>;
  findByEmail(email: string): Promise<StoredAuthUser | null>;
  findActiveById(id: number): Promise<AuthUser | null>;
}

export type AuthRepositoryErrorCode = "email_already_exists";

export class AuthRepositoryError extends Error {
  constructor(public readonly code: AuthRepositoryErrorCode) {
    super(code);
    this.name = "AuthRepositoryError";
  }
}
