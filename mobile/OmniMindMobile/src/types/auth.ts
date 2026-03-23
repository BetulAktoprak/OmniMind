export type RegisterRequest = {
  email: string;
  username: string;
  password: string;
  displayName?: string;
  consents?: string[]; //enum string "TermsOfService" gibi
};

export type LoginRequest = {
  login: string; //email veya username
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  expiresAt: string;
  userId: string;
  email: string;
  username: string;
};
