import { z } from "zod";
import { HttpError } from "./errors.js";

export const validate =
  (schema: z.ZodSchema) =>
  (req: any, _res: any, next: any) => {
    try { req.parsed = schema.parse(req.body); next(); }
    catch (e: any) { next(new HttpError(400, e.errors?.[0]?.message ?? "Invalid body")); }
  };
