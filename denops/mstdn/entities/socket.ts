import * as methods from "./methods.ts";

import { User } from "./user.ts";

import type {
	Announcement,
	Conversation,
	Notification,
	Reaction,
	Status,
} from "./masto.d.ts";
import { isString } from "https://deno.land/x/unknownutil@v3.10.0/mod.ts#^.ts";
import camelcaseKeys from "npm:camelcase-keys";

/**
 * 非同期取得のストリームの種類
 */
export type StreamType =
	| "public"
	| "public:media"
	| "public:local"
	| "public:local:media"
	| "public:remote"
	| "public:remote:media"
	| "hashtag"
	| "hashtag:local"
	| "user"
	| "user:notification"
	| "list"
	| "direct";

/**
 * ストリームの種類
 */
export interface Stream<T extends StreamType> {
	stream: T;
	list: T extends "list" ? string : undefined;
	tag: T extends "hashtag" | "hashtag:local" ? string : undefined;
}

/**
 * 通信先
 */
export interface Method {
	/**
	 * WebSocket確立のためのStream
	 */
	get stream(): Stream<StreamType>;
	/**
	 * REST APIのエンドポイント
	 */
	get endpoint(): string;
}

/**
 * mstdn://* 形式のUriをパースしたもの
 */
export interface Uri {
	method: Method;
	user: User;
}

/**
 * mstdn://* 形式のUri文字列をパースする
 *
 * # 有効なURLパターン
 * - mstdn://user@example.com/public
 * - mstdn://user@example.com/public/media
 * - mstdn://user@example.com/public/tag/:hashtag
 * - mstdn://user@example.com/local
 * - mstdn://user@example.com/local/media
 * - mstdn://user@example.com/local/tag/:hashtag
 * - mstdn://user@example.com/remote
 * - mstdn://user@example.com/remote/media
 */
export function parseUri(uri: string): Uri {
	if (!uri.startsWith("mstdn://")) {
		throw new Error("parse error");
	}
	const [userString, ...queryString] = uri.slice(8).split("/");
	const user = new User(userString);
	let method: Method | undefined = undefined;
	switch (queryString[0]) {
		case "public":
			switch (queryString[1]) {
				case "tag":
					method = new methods.HashTag({
						local: false,
						tag: queryString[2],
					});
					break;
				case "media":
					method = new methods.Public({
						only_media: true,
						mode: null,
					});
					break;
				case undefined:
					method = new methods.Public({
						only_media: false,
						mode: null,
					});
					break;
			}
			break;
		case "local":
			switch (queryString[1]) {
				case "tag":
					method = new methods.HashTag({
						local: true,
						tag: queryString[2],
					});
					break;
				case "media":
					method = new methods.Public({
						only_media: true,
						mode: "local",
					});
					break;
				case undefined:
					method = new methods.Public({
						only_media: false,
						mode: "local",
					});
					break;
			}
			break;
		case "remote":
			switch (queryString[1]) {
				case "media":
					method = new methods.Public({
						only_media: true,
						mode: "local",
					});
					break;
				case undefined:
					method = new methods.Public({
						only_media: false,
						mode: "remote",
					});
					break;
			}
			break;
		case "user":
			break;
		case "list":
			break;
		case "direct":
			break;
		default:
			break;
	}
	if (method) {
		return {
			user,
			method,
		};
	}
	throw new Error(`method "${queryString[0]}" is unimplemented`);
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

/**
 * MstdnSocketの初期化引数
 */
type MstdnSocketOptions = {
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
	onUpdate?: undefined | ((status: Status) => unknown);
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
};

export class MstdnSocket {
	private uri: Uri;
	private opts: MstdnSocketOptions;

	private sock: WebSocket;
	private readonly _urls: {
		readonly wss: URL;
		readonly rest: URL;
	};
	get urls() {
		return this._urls;
	}
	get status(): "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED" {
		switch (this.sock.readyState) {
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
	constructor(
		uri: Uri | string,
		opts: MstdnSocketOptions = {},
		// protocols?: string | string[] | undefined,
	) {
		this.uri = isString(uri) ? parseUri(uri) : uri;
		this.opts = opts;
		const wss = new URL(`wss://${this.uri.user.server}/api/v1/streaming`);
		wss.searchParams.set("access_token", this.uri.user.token);
		wss.searchParams.set("stream", this.uri.method.stream.stream);
		const rest = new URL(
			`https://${this.uri.user.server}/${this.uri.method.endpoint}`,
		);
		this._urls = {
			wss,
			rest,
		};
		this.sock = this.createSocket();
	}
	/**
	 * 手動で取得する
	 */
	public async fetch(
		opts: {
			before?: Status | undefined;
		} = {},
	) {
		const url = this.urls.rest;
		if (opts.before) {
			url.searchParams.set("max_id", opts.before.id);
		}
		const data = await (
			await fetch(url, {
				headers: {
					Authorization: `Bearer ${this.uri.user.token}`,
				},
			})
		).text();
		const parsedData = JSON.parse(data);
		if (parsedData.error) {
			if (this.opts.onError) {
				this.opts.onError(`${parsedData.error}`);
			}
			return [];
		}
		const statuses: Status[] = camelcaseKeys(parsedData);
		if (this.opts.onUpdate) {
			for (const status of statuses) {
				await this.opts.onUpdate(status);
			}
		}
		return statuses;
	}
	private createSocket(): WebSocket {
		if (this.opts.onCreatingSocket) {
			this.opts.onCreatingSocket();
		}
		const socket = new WebSocket(this.urls.wss);
		socket.onopen = async () => {
			if (this.opts.onOpen) {
				await this.opts.onOpen();
			}
		};
		socket.onerror = (ev) => {
			this.close();
			if (this.opts.onError) {
				this.opts.onError(ev);
			}
		};
		socket.onmessage = (ev) => {
			const data: StreamResponse = camelcaseKeys(JSON.parse(ev.data));
			switch (data.event) {
				case "update": {
					if (this.opts.onUpdate) {
						const status: Status = camelcaseKeys(JSON.parse(data.payload));
						this.opts.onUpdate(status);
					}
					break;
				}
				case "delete": {
					if (this.opts.onDelete) {
						const id: string = data.payload;
						this.opts.onDelete(id);
					}
					break;
				}
				case "notification": {
					if (this.opts.onNotification) {
						const notification: Notification = camelcaseKeys(
							JSON.parse(data.payload),
						);
						this.opts.onNotification(notification);
					}
					break;
				}
				case "filters_changed":
					if (this.opts.onFiltersChanged) {
						this.opts.onFiltersChanged();
					}
					break;
				case "conversation": {
					if (this.opts.onConversation) {
						const conersation: Conversation = camelcaseKeys(
							JSON.parse(data.payload),
						);
						this.opts.onConversation(conersation);
					}
					break;
				}
				case "announcement": {
					if (this.opts.onAnnouncement) {
						const announcement: Announcement = camelcaseKeys(
							JSON.parse(data.payload),
						);
						this.opts.onAnnouncement(announcement);
					}
					break;
				}
				case "announcement.reaction": {
					if (this.opts.onAnnouncementReaction) {
						const reaction: Reaction = camelcaseKeys(JSON.parse(data.payload));
						this.opts.onAnnouncementReaction(reaction);
					}
					break;
				}
				case "announcement.delete": {
					if (this.opts.onAnnouncementDelete) {
						const id: string = data.payload;
						this.opts.onAnnouncementDelete(id);
					}
					break;
				}
				case "status.update": {
					if (this.opts.onStatusUpdate) {
						const status: Status = camelcaseKeys(JSON.parse(data.payload));
						this.opts.onStatusUpdate(status);
					}
					break;
				}
			}
		};
		return socket;
	}
	/**
	 * 再接続する
	 */
	public reconnect() {
		this.close();
		this.sock = this.createSocket();
	}
	/**
	 * 切断する
	 */
	public close() {
		this.sock.close();
	}
}
