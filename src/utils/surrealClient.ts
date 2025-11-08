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
    private url: string,       // ex: http://localhost:8000/sql  OU  http://localhost:8000
    private ns: string,
    private db: string,
    private user: string,
    private pass: string
  ) {
    // normaliser /sql et /rpc
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

  /**
   * Exécute une requête SQL en essayant plusieurs formats pour compat v1/v2:
   * 1) /sql  +  Content-Type: application/json  { query: "<SQL>" }
   * 2) /sql  +  Content-Type: text/plain        "<SQL>"
   * 3) /rpc  +  JSON-RPC { method: "query", params: ["<SQL>"] }
   */
  async sql<T = any>(query: string): Promise<T[]> {
    const headers = this.commonHeaders();

    // Tentative A: /sql + application/json
    let res = await fetch(this.sqlUrl, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    // Tentative B: /sql + text/plain si 415/404/501
    if (res.status === 415 || res.status === 404 || res.status === 501) {
      res = await fetch(this.sqlUrl, {
        method: "POST",
        headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" },
        body: query,
      });
    }

    // Tentative C: /rpc JSON-RPC si toujours pas OK
    if (!res.ok) {
      const tryRpc = res.status === 415 || res.status === 404 || res.status === 501;
      if (tryRpc) {
        const rpc = await fetch(this.rpcUrl, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method: "query",
            params: [query],
          }),
        });
        if (!rpc.ok) {
          const txt = await rpc.text();
          throw new Error(`Surreal RPC error: ${rpc.status} ${txt}`);
        }
        const payload = await rpc.json();
        // payload.result ressemble à SurrealSqlResult
        const list = (payload?.result ?? []) as SurrealSqlResult<T>;
        const first = Array.isArray(list) ? list[0] : undefined;
        return (first?.result ?? []) as T[];
      }

      const text = await res.text();
      throw new Error(`Surreal error: ${res.status} ${text}`);
    }

    // Format /sql: tableau de résultats [{ status, time, result }]
    const data = (await res.json()) as SurrealSqlResult<T>;
    const first = Array.isArray(data) ? data[0] : undefined;
    return (first?.result ?? []) as T[];
  }
}
