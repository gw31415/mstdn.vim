import type {
	AccountCredentials,
	Announcement,
	Conversation,
	CreateStatusParams,
	Notification,
	Reaction,
	Status,
} from "./masto.d.ts";
import { fromFileUrl } from "https://deno.land/std@0.205.0/path/mod.ts";
import { DB, DB_URL } from "./db.ts";
import * as sqlite from "https://deno.land/x/sqlite@v3.8/mod.ts";
import { Method, StreamType } from "./uri.ts";
import camelcaseKeys from "npm:camelcase-keys";

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
 * WebSocketから返ってくるデータ形式
 */
interface StreamResponse {
	stream: StreamType[];
	event: Event;
	payload: string;
}
/**
 * MastodonのストリーミングAPIの定義するイベント
 */
type Event =
	| "update"
	| "delete"
	| "notification"
	| "filters_changed"
	| "conversation"
	| "announcement"
	| "announcement.reaction"
	| "announcement.delete"
	| "status.update";

type Callbacks = {
	/**
	 * エラーが起きた時のコールバック
	 */
	onError?:
		| undefined
		| ((ev: globalThis.Event | ErrorEvent | string) => unknown);
	/**
	 * 接続の試行開始時のコールバック
	 */
	onCreatingSocket?: undefined | (() => unknown);
	/**
	 * 接続開始時のコールバック
	 */
	onOpen?: undefined | (() => unknown);
	/**
	 * 投稿取得時のコールバック
	 */
	onUpdate?: undefined | ((...status: Status[]) => unknown);
	/**
	 * 投稿削除時のコールバック
	 */
	onDelete?: undefined | ((id: string) => unknown);
	/**
	 * 通知時のコールバック
	 */
	onNotification?: undefined | ((notification: Notification) => unknown);
	/**
	 * フィルター変更時のコールバック
	 */
	onFiltersChanged?: undefined | (() => unknown);
	/**
	 * DM取得時のコールバック
	 */
	onConversation?: undefined | ((conversation: Conversation) => unknown);
	/**
	 * アナウンス投稿時のコールバック
	 */
	onAnnouncement?: undefined | ((announcement: Announcement) => unknown);
	/**
	 * アナウンスにリアクションされた時のコールバック
	 */
	onAnnouncementReaction?: undefined | ((reaction: Reaction) => unknown);
	/**
	 * アナウンスが削除された時のコールバック
	 */
	onAnnouncementDelete?: undefined | ((id: string) => unknown);
	/**
	 * 投稿編集時のコールバック
	 */
	onStatusUpdate?: undefined | ((status: Status) => unknown);
	/**
	 * 終了時のコールバック
	 */
	onClose?: undefined | ((ev: CloseEvent) => unknown);
};

interface Client {
	id: number;
	method: Method;
	callbacks: Callbacks;
}

const ActiveUserList: Map<
	string,
	{
		clients: Client[];
		sock: WebSocket | null;
	}
> = new Map();

function getClient(user: User): {
	clients: Client[];
	sock: WebSocket | null;
} {
	return (
		ActiveUserList.get(user.toString()) ?? {
			clients: [],
			sock: null,
		}
	);
}

function setClient(
	user: User,
	data: {
		clients: Client[];
		sock: WebSocket | null;
	},
) {
	ActiveUserList.set(user.toString(), data);
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
	 * 接続状態を確認する
	 */
	public get status(): "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED" {
		const { sock } = getClient(this);
		if (!sock) {
			return "CLOSED";
		}
		switch (sock.readyState) {
			case WebSocket.CONNECTING:
				return "CONNECTING";
			case WebSocket.OPEN:
				return "OPEN";
			case WebSocket.CLOSING:
				return "CLOSING";
			case WebSocket.CLOSED:
				return "CLOSED";
		}
		throw new Error("unreachable");
	}

	/**
	 * 登録する
	 */
	public subscribe(client: Client) {
		const { clients, sock } = getClient(this);
		clients.push(client);
		setClient(this, { clients, sock });
		if (this.status === "OPEN") {
			client.method;
			sock?.send(
				JSON.stringify({
					type: "subscribe",
					...client.method.stream,
				}),
			);
		}
		for (const fn of clients.map((c) => c.callbacks.onOpen)) {
			if (fn) fn();
		}
	}

	/**
	 * 登録を解除する
	 */
	public close(id: number) {
		const users = Array.from(ActiveUserList.entries()).filter(
			([_, { clients }]) => {
				return clients.filter((v) => v.id === id).length > 0;
			},
		);
		if (users.length > 1) {
			throw new Error("duplicate clients");
		} else if (users.length !== 1) {
			throw new Error("client not found");
		}
		const [server, { clients, sock }] = users[0];
		if (clients.length === 1) {
			getClient(this).sock?.close();
			ActiveUserList.delete(server);
		} else {
			const clientIndex = clients.findIndex((c) => c.id === id);
			const client = clients[clientIndex];
			if (!client) {
				throw new Error("client not found");
			}
			if (!client.method.stream.tag && !client.method.stream.list) {
				sock?.send(
					JSON.stringify({
						type: "unsubscribe",
						...client.method.stream,
					}),
				);
			}
			clients.splice(clientIndex, 1);
			ActiveUserList.set(server, { clients, sock });
		}
	}

	/**
	 * 指定したIDのタイムラインにおける投稿のデフォルト値を返す
	 */
	public timelineStatusDefaults(id: number): CreateStatusParams {
		const { clients } = getClient(this);
		const client = clients.find((c) => c.id === id);
		if (!client) {
			throw new Error("client not found");
		}
		if (client.method.stream.tag) {
			return { status: ` #${client.method.stream.tag}` };
		}
		return { status: "" };
	}

	/**
	 * 手動で取得する
	 */
	public async fetch(
		id: number,
		opts: { before?: Status | undefined } = {},
	): Promise<Status[]> {
		const { clients } = getClient(this);
		const client = clients.find((c) => c.id === id);
		if (!client) {
			throw new Error("client not found");
		}
		const url = new URL(`https://${this.server}/${client.method.endpoint}`);
		if (opts.before) {
			url.searchParams.set("max_id", opts.before.id);
		}
		const data = await (
			await fetch(url, {
				headers: {
					Authorization: `Bearer ${this.token}`,
				},
			})
		).text();
		const parsedData = JSON.parse(data);
		if (parsedData.error) {
			if (client.callbacks.onError) {
				client.callbacks.onError(`${parsedData.error}`);
			}
			return [];
		}
		let statuses: Status[] = camelcaseKeys(parsedData);
		const tag = client.method.stream.tag;
		if (tag) {
			statuses = statuses.filter((s) =>
				s.tags.map((t) => t.name).includes(tag)
			);
		}
		if (client.callbacks.onUpdate) {
			await client.callbacks.onUpdate(...statuses);
		}
		return statuses;
	}

	public async rest(
		endpoint: string,
		httpmethod: string,
		body: unknown,
	): Promise<string> {
		const res = await fetch(new URL(`https://${this.server}${endpoint}`), {
			method: httpmethod,
			body: JSON.stringify(body),
			headers: {
				Authorization: `Bearer ${this.token}`,
				"Content-type": "application/json",
			},
		});
		return await res.text();
	}

	/**
	 * 再接続する
	 */
	public reconnect() {
		const { clients, sock } = getClient(this);
		if (this.status !== "CLOSED" && this.status !== "CLOSING") {
			sock?.close();
		}
		this.connect();
		for (const fn of clients.map((c) => c.callbacks.onOpen)) {
			if (fn) fn();
		}
	}

	/**
	 * 接続する
	 */
	public connect() {
		if (this.status !== "CLOSED" && this.status !== "CLOSING") {
			throw new Error(
				"Cannot open a connection that has not been closed",
			);
		}
		const { clients } = getClient(this);
		const streams = clients.map((c) => {
			return { type: "subscribe", ...c.method.stream };
		});
		for (const fn of clients.map((c) => c.callbacks.onCreatingSocket)) {
			if (fn) fn();
		}
		const wss = new URL(`wss://${this.server}/api/v1/streaming`);
		wss.searchParams.set("access_token", this.token);
		const socket = new WebSocket(wss);
		socket.onopen = () => {
			for (const s of streams) {
				socket.send(JSON.stringify(s));
			}
		};
		socket.onclose = async (ev) => {
			for (const fn of clients.map((c) => c.callbacks.onClose)) {
				if (fn) await fn(ev);
			}
		};
		socket.onerror = (ev) => {
			for (const fn of clients.map((c) => c.callbacks.onError)) {
				if (fn) fn(ev);
			}
		};
		socket.onmessage = (ev) => {
			this.add(camelcaseKeys(JSON.parse(ev.data)));
		};
		setClient(this, {
			clients,
			sock: socket,
		});
	}
	/**
	 * 文字列に変換
	 */
	public toString() {
		return `${this.username}@${this.server}`;
	}

	/**
	 * 手動で追加する
	 */
	private add(data: StreamResponse) {
		const { clients } = getClient(this);
		const streamtype = data.stream;
		const parsePayload = () => camelcaseKeys(JSON.parse(data.payload));
		switch (data.event) {
			case "update": {
				const status: Status = parsePayload();
				for (
					const fn of clients.flatMap((c) =>
						streamtype.includes(c.method.stream.stream) &&
							(!c.method.stream.tag ||
								status.tags.map((t) => t.name).includes(
									c.method.stream.tag,
								))
							? [c.callbacks.onUpdate]
							: []
					)
				) {
					if (fn) fn(status);
				}
				break;
			}
			case "delete": {
				for (
					const fn of clients.flatMap((c) =>
						streamtype.includes(c.method.stream.stream)
							? [c.callbacks.onDelete]
							: []
					)
				) {
					const id: string = data.payload;
					if (fn) fn(id);
				}
				break;
			}
			case "notification": {
				for (
					const fn of clients.flatMap((c) =>
						streamtype.includes(c.method.stream.stream)
							? [c.callbacks.onNotification]
							: []
					)
				) {
					const notification: Notification = parsePayload();
					if (fn) fn(notification);
				}
				break;
			}
			case "filters_changed":
				for (
					const fn of clients.flatMap((c) =>
						streamtype.includes(c.method.stream.stream)
							? [c.callbacks.onFiltersChanged]
							: []
					)
				) {
					if (fn) fn();
				}
				break;
			case "conversation": {
				for (
					const fn of clients.flatMap((c) =>
						streamtype.includes(c.method.stream.stream)
							? [c.callbacks.onConversation]
							: []
					)
				) {
					const conersation: Conversation = parsePayload();
					if (fn) fn(conersation);
				}
				break;
			}
			case "announcement": {
				for (
					const fn of clients.flatMap((c) =>
						streamtype.includes(c.method.stream.stream)
							? [c.callbacks.onAnnouncement]
							: []
					)
				) {
					const announcement: Announcement = parsePayload();
					if (fn) fn(announcement);
				}
				break;
			}
			case "announcement.reaction": {
				for (
					const fn of clients.flatMap((c) =>
						streamtype.includes(c.method.stream.stream)
							? [c.callbacks.onAnnouncementReaction]
							: []
					)
				) {
					const reaction: Reaction = parsePayload();
					if (fn) fn(reaction);
				}
				break;
			}
			case "announcement.delete": {
				for (
					const fn of clients.flatMap((c) =>
						streamtype.includes(c.method.stream.stream)
							? [c.callbacks.onAnnouncementDelete]
							: []
					)
				) {
					const id: string = data.payload;
					if (fn) fn(id);
				}
				break;
			}
			case "status.update": {
				const status: Status = parsePayload();
				for (
					const fn of clients.flatMap((c) =>
						streamtype.includes(c.method.stream.stream) &&
							(!c.method.stream.tag ||
								status.tags.map((t) => t.name).includes(
									c.method.stream.tag,
								))
							? [c.callbacks.onStatusUpdate]
							: []
					)
				) {
					if (fn) fn(status);
				}
				break;
			}
		}
	}
}
