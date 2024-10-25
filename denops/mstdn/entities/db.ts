import cache_dir from "https://deno.land/x/dir@1.5.2/cache_dir/mod.ts";
import { fromFileUrl, toFileUrl } from "jsr:@std/path";
import * as sqlite from "jsr:@mainframe-api/deno-sqlite";

const __cache_dir = cache_dir();
/**
 * キャッシュディレクトリのURL
 */
export const CACHE_DIR =
	__cache_dir !== null
		? new URL("./mstdn.vim/", toFileUrl(__cache_dir))
		: new URL("./.cache/mstdn.vim/", import.meta.url);
Deno.mkdirSync(CACHE_DIR, { recursive: true });

/**
 * データベースのURL
 */
export const DB_URL = new URL("db.sqlite3", CACHE_DIR);

/**
 * データベース(書き込み可能)
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
