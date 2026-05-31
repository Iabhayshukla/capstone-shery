export interface SignUpBody {
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface PasswordResetBody {
  email: string;
}