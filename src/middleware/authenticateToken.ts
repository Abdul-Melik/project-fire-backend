import jwt from "jsonwebtoken";
import env from "../utils/validate-env";

function authenticateToken(token: string): any {
  try {
    const decodedToken = jwt.verify(token, env.JWT_SECRET);
    return decodedToken;
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
}

export { authenticateToken };
