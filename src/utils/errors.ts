export class HttpError extends Error {
    constructor(public status: number, message: string) { super(message); }
  }
  export const errorHandler = (err: any, _req: any, res: any, _next: any) => {
    const status = err?.status ?? 500;
    const msg = err?.message ?? "Internal Server Error";
    res.status(status).json({ error: msg });
  };
  