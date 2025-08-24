import jwt, { type JwtPayload, verify } from "jsonwebtoken";

export function validateUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decoded.userId;
  } catch (error) {
    console.log(error);
    return null;
  }
}
