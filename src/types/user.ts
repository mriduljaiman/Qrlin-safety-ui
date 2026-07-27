export interface User {
    id: number;
    email: string;
    fullName: string;
    role: string;
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
  }

  export interface OtpVerifyRequest {
    email: string;
    otp: string;
  }

  export interface GoogleAuthRequest {
    idToken: string;
  }

  export interface AuthResponse {
    token: string;
    type: string;
    userId: number;
    email: string;
    role: string;
  }
