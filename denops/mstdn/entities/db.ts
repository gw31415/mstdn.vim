import { xdgCache } from "npm:xdg-basedir";
import { DB as SQLITEDB } from "jsr:@mainframe-api/deno-sqlite";
import { fromFileUrl, toFileUrl } from "jsr:@std/path";

/**
 * キャッシュディレクトリのURL
 */
export const CACHE_DIR =
	xdgCache !== undefined
		? new URL("./mstdn.vim/", toFileUrl(xdgCache))
		: new URL("./.cache/mstdn.vim/", import.meta.url);
Deno.mkdirSync(CACHE_DIR, { recursive: true });

/**
 * データベースのURL
 */
export const DB_URL = new URL("db.sqlite3", CACHE_DIR);

/**
 * データベース(書き込み可能)
 */
const DBwritable = new SQLITEDB(fromFileUrl(DB_URL));
DBwritable.query(
	"CREATE TABLE IF NOT EXISTS users (username TEXT NOT NULL, server TEXT NOT NULL, token TEXT NOT NULL, PRIMARY KEY(username, server))",
);
DBwritable.close();
/**
 * データベース
 */
export const DB = () => new SQLITEDB(fromFileUrl(DB_URL), { mode: "read" });
