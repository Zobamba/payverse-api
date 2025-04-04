export interface CreateUser {
  id?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  password: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Login {
  email: string;
  password: string;
}

export interface ResetPassword {
  token: string;
  newPassword: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}
