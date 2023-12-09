import cache_dir from "https://deno.land/x/dir@1.5.2/cache_dir/mod.ts";
import {
  fromFileUrl,
  toFileUrl,
} from "https://deno.land/std@0.205.0/path/mod.ts";
import * as sqlite from "https://deno.land/x/sqlite@v3.8/mod.ts";

const __cache_dir = cache_dir();
/**
 * キャッシュディレクトリのURL
 */
export const CACHE_DIR = __cache_dir !== null
  ? new URL("./mstdn.vim/", toFileUrl(__cache_dir))
  : new URL("./.cache/mstdn.vim/", import.meta.url);
Deno.mkdirSync(CACHE_DIR, { recursive: true });

/**
 * データベースのURL
 */
export const DB_URL = new URL("db.sqlite3", CACHE_DIR);

/**
 * データベース
 */
const DBwritable = new sqlite.DB(fromFileUrl(DB_URL));
DBwritable.query(
  "CREATE TABLE IF NOT EXISTS users (username TEXT NOT NULL, server TEXT NOT NULL, token TEXT NOT NULL, PRIMARY KEY(username, server))",
);
DBwritable.close();
/**
 * データベース
 */
export const DB = () => new sqlite.DB(fromFileUrl(DB_URL), { mode: "read" });
