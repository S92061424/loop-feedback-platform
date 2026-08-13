import jwt from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
  workspaceId: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const JWT_SECRET = process.env.JWT_SECRET as string;
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): TokenPayload => {
  const JWT_SECRET = process.env.JWT_SECRET as string;
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};