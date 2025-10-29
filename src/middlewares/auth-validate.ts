import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function auth(req: any, res: Response, next: NextFunction): void {
  const bearerHeader = req.headers.authorization;

  if (typeof bearerHeader === "undefined") {
    res.status(401).send({
      message:
        "You are not authorized to consume this resource. Please sign in",
    });
    return;
  }

  const token = bearerHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err: any, authData: any) => {
    if (err) {
      res.status(401).send({
        message:
          "You are not authorized to consume this resource. Please sign in",
      });
      return;
    } else {
      req.user = authData.data;
      next();
    }
  });
}
