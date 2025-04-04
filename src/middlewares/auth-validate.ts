import jwt, { VerifyErrors } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
export function verifyAuthToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== "undefined") {
    const token = bearerHeader.split(" ")[1];
    (req as any).token = token;
    next();
  } else {
    res.status(401).send({
      message:
        "You are not authorized to consume this resource. Please sign in",
    });
  }
}

export function validateToken(req: any, res: Response, next: NextFunction) {
  jwt.verify(
    req.token,
    process.env.JWT_SECRET,
    (err: VerifyErrors, authData: any) => {
      if (err) {
        res.status(401).send({
          message:
            "You are not authorized to consume this resource. Please sign in",
        });
      } else {
        req.user = authData.data;
        next();
      }
    }
  );
}
