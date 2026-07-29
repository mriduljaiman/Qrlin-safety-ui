export interface User {
    id: number;
    email: string;
    fullName: string;
    role: string;
    mustChangePassword: boolean;
  }

  export interface LoginRequest {
    email: string;
    password: string;
  }

  export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    referralCode?: string;
  }

  export interface OtpVerifyRequest {
    email: string;
    otp: string;
  }

  export interface GoogleAuthRequest {
    idToken: string;
    referralCode?: string;
  }

  export interface AuthResponse {
    token: string;
    type: string;
    userId: number;
    email: string;
    role: string;
    mustChangePassword: boolean;
  }
