import { Buffer } from "buffer";

type SurrealSqlResult<T = any> = Array<{
  status: string;
  time: string;
  result?: T[];
  detail?: any;
}>;

export class SurrealClient {
  private base: string;
  private sqlUrl: string;
  private rpcUrl: string;

  constructor(
    private url: string,
    private ns: string,
    private db: string,
    private user: string,
    private pass: string
  ) {

    if (this.url.endsWith("/sql")) {
      this.base = this.url.replace(/\/sql$/, "");
      this.sqlUrl = this.url;
    } else {
      this.base = this.url.replace(/\/$/, "");
      this.sqlUrl = this.base + "/sql";
    }
    this.rpcUrl = this.base + "/rpc";
  }

  private authHeader() {
    return "Basic " + Buffer.from(`${this.user}:${this.pass}`).toString("base64");
  }

  private commonHeaders() {
    return {
      "NS": this.ns,
      "DB": this.db,
      "Authorization": this.authHeader(),
      "Accept": "application/json",
    } as Record<string, string>;
  }

  async sql<T = any>(query: string): Promise<T[]> {
    const headers = this.commonHeaders();

    let res = await fetch(this.sqlUrl, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });


    const data = (await res.json()) as SurrealSqlResult<T>;
    const first = Array.isArray(data) ? data[0] : undefined;
    return (first?.result ?? []) as T[];
  }
}
