import { Buffer } from "buffer";

export class SurrealClient {
  constructor(
    private url: string,
    private ns: string,
    private db: string,
    private user: string,
    private pass: string
  ) {}

  async sql<T = any>(query: string): Promise<T[]> {
    const headers: any = {
      "Content-Type": "text/plain",
      "NS": this.ns,
      "DB": this.db,
      "Authorization": "Basic " + Buffer.from(`${this.user}:${this.pass}`).toString("base64")
    };
    const res = await fetch(this.url, { method: "POST", headers, body: query });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Surreal error: ${res.status} ${text}`);
    }

    const data = await res.json();
    const results: T[] = data?.[0]?.result ?? [];
    return results;
  }
}
