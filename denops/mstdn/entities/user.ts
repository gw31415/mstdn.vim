import { AccountCredentials } from "./masto.d.ts";
import { fromFileUrl } from "https://deno.land/std@0.205.0/path/mod.ts";
import { DB, DB_URL } from "./db.ts";
import * as sqlite from "https://deno.land/x/sqlite@v3.8/mod.ts";

/**
 * ログイン済みユーザー一覧を得る
 */
export function listLoginUsers(): { server: string; username: string }[] {
	/**
	 * セットアップ済みクエリ
	 */
	const db = DB();
	const entries = db.queryEntries<{ username: string; server: string }>(
		"SELECT username, server FROM users",
	);
	db.close();
	return entries;
}

/**
 * トークンを登録する
 */
export async function login(opts: { server: string; token: string }) {
	const url = `https://${opts.server}/api/v1/accounts/verify_credentials`;
	const res = await fetch(url, {
		headers: {
			Authorization: `Bearer ${opts.token}`,
		},
	});
	const body = await res.text();
	if (res.status !== 200) {
		throw new Error(body);
	}
	const credentials: AccountCredentials = JSON.parse(body);
	const username = credentials.username;
	const DB = new sqlite.DB(fromFileUrl(DB_URL));
	DB.query(
		"INSERT INTO users (username, server, token) VALUES (:username, :server, :token) ON CONFLICT (username, server) DO UPDATE SET token = :token",
		{
			username,
			server: opts.server,
			token: opts.token,
		},
	);
	DB.close();
}

/**
 * トークンを削除する
 */

export function logout(opts: { username: string; server: string }) {
	if (
		listLoginUsers().filter(
			(u) => u.username === opts.username && u.server === opts.server,
		).length === 0
	) {
		throw new Error("user not found");
	}
	const DB = new sqlite.DB(fromFileUrl(DB_URL));
	DB.query(
		"DELETE FROM users WHERE username = :username AND server = :server",
		{
			username: opts.username,
			server: opts.server,
		},
	);
	DB.close();
}

/**
 * 保存済みユーザ
 */
export class User {
	/**
	 * ユーザーネーム
	 */
	public readonly username: string;
	/**
	 * サーバーアドレス
	 */
	public readonly server: string;
	/**
	 * トークン
	 */
	public readonly token: string;

	constructor(str: string) {
		const split = str.split("@");
		if (split.length !== 2) {
			throw new Error("parse error");
		}
		const userdata = {
			username: split[0],
			server: split[1],
		};
		const db = DB();
		const query = db.prepareQuery<
			[string],
			{ token: string },
			{ username: string; server: string }
		>(
			"SELECT token FROM users WHERE username = :username AND server = :server",
		);
		const row = query.firstEntry(userdata);
		query.finalize();
		db.close();
		if (!row) {
			throw new Error("not logged-in");
		}
		this.server = userdata.server;
		this.username = userdata.username;
		this.token = row.token;
	}
	/**
	 * 文字列に変換
	 */
	public toString() {
		return `${this.username}@${this.server}`;
	}
}
