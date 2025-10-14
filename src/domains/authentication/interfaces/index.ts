export interface IJWTPayload {
  sub: string;
  role: string;
  type: string;
  iat: number;
  exp: number;
}
