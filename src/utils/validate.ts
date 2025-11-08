import { z } from "zod";
import { HttpError } from "./errors.js";

export const validate =
  (schema: z.ZodSchema) =>
  (req: any, _res: any, next: any) => {
    try {
      req.parsed = schema.parse(req.body);
      next();
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        const msg = e.issues.map(err => `${err.path.join(".")}: ${err.message}`).join("; ");
        return next(new HttpError(400, msg));
      }
      return next(new HttpError(400, "Invalid body"));
    }
  };
