import * as methods from "./methods.ts";

import { User } from "./user.ts";

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
 * - mstdn://user@example.com/home
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
		case "home":
			method = new methods.Home();
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
