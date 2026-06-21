declare module "pg" {
  export type QueryResultRow = Record<string, unknown>;

  export type QueryResult<T extends QueryResultRow = QueryResultRow> = {
    rows: T[];
    rowCount: number | null;
  };

  export type PoolConfig = {
    connectionString?: string;
    ssl?: false | {
      ca?: string;
      rejectUnauthorized?: boolean;
      servername?: string;
    };
  };

  export class Pool {
    constructor(config?: PoolConfig);
    query<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
  }

  const pg: {
    Pool: typeof Pool;
  };

  export default pg;
}
