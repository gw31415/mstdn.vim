import { Method, StreamType, Stream } from "./socket.ts";

export class HashTag implements Method {
	private local: boolean;
	private tag: string;
	constructor(args: { local: boolean; tag: string }) {
		this.local = args.local;
		this.tag = args.tag;
	}
	get stream(): Stream<StreamType> {
		const stream: StreamType = this.local ? "hashtag:local" : "hashtag";
		return {
			stream,
			list: undefined,
			tag: this.tag,
		};
	}
	get endpoint(): string {
		return `/api/v1/timelines/tag/${this.tag}?local=${this.local}`;
	}
}

export class Public implements Method {
	private only_media: boolean;
	private local: boolean;
	private remote: boolean;
	constructor(args: {
		only_media: boolean;
		mode: "local" | "remote" | null;
	}) {
		if (args.mode === "local") {
			this.local = true;
			this.remote = false;
		} else if (args.mode === "remote") {
			this.local = false;
			this.remote = true;
		} else {
			this.local = false;
			this.remote = false;
		}
		this.only_media = args.only_media;
	}
	get stream(): Stream<StreamType> {
		const stream: StreamType = this.local
			? this.only_media ? "public:local:media" : "public:local"
			: this.remote
			? this.only_media ? "public:remote:media" : "public:remote"
			: this.only_media
			? "public:media"
			: "public";
		return {
			stream,
			list: undefined,
			tag: undefined,
		};
	}
	get endpoint(): string {
		return `/api/v1/timelines/public?local=${this.local}&only_media=${this.only_media}&remote=${this.remote}`;
	}
}
