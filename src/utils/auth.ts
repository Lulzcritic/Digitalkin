import dotenv from "dotenv";

dotenv.config();

export const apiKeyMiddleware = (req: any, res: any, next: any) => {
    const required = process.env.API_KEY;
    if (!required) return next();
    const key = req.header("x-api-key");
    if (key !== required) return res.status(401).json({ error: "Unauthorized" });
    next();
  };
  