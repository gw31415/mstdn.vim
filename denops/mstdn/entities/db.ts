import { xdgCache } from "npm:xdg-basedir";
import { DB as SQLITEDB } from "jsr:@mainframe-api/deno-sqlite";
import { fromFileUrl, join } from "jsr:@std/path";

/**
 * キャッシュディレクトリのパス
 */
export const CACHE_DIR =
	xdgCache !== undefined
		? join(xdgCache, "mstdn.vim")
		: join(fromFileUrl(import.meta.url), ".cache/mstdn.vim");
Deno.mkdirSync(CACHE_DIR, { recursive: true });

/**
 * データベースのパス
 */
export const DB_PATH = join(CACHE_DIR, "db.sqlite");

/**
 * データベース(書き込み可能)
 */
const DBwritable = new SQLITEDB(DB_PATH);
DBwritable.query(
	"CREATE TABLE IF NOT EXISTS users (username TEXT NOT NULL, server TEXT NOT NULL, token TEXT NOT NULL, PRIMARY KEY(username, server))",
);
DBwritable.close();
/**
 * データベース
 */
export const DB = () => new SQLITEDB(DB_PATH, { mode: "read" });
