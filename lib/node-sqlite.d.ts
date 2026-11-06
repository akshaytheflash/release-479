/**
 * Minimal typings for Node's built-in `node:sqlite` (DatabaseSync).
 * Present since Node 22.5; @types/node@20 predates it, so we declare just
 * what lib/db.ts uses. Runtime support verified on Node v24.22.0.
 */
declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(path: string, options?: Record<string, unknown>);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
  export interface StatementSync {
    run(
      ...params: Array<string | number | bigint | null | undefined>
    ): { changes: number | bigint; lastInsertRowid: number | bigint };
    all(...params: Array<string | number | bigint | null | undefined>): unknown[];
    get(...params: Array<string | number | bigint | null | undefined>): unknown;
  }
}
