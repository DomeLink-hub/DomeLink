import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface JwtPayload {
  sub: string;
  email: string;
  role: "homeowner" | "architect" | "admin";
  tokenVersion: number;
}

export const signJwt = (payload: JwtPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
