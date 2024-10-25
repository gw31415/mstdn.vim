import * as batch from "jsr:@denops/std/batch";
import type { Denops } from "jsr:@denops/std";
import * as fn from "jsr:@denops/std/function";
// @deno-types="npm:@types/turndown"
import TurndownService from "npm:turndown";
// @deno-types="npm:@types/async-lock"
import AsyncLock from "npm:async-lock";

const locker = new AsyncLock({ timeout: 3000 });
const locker_id = self.crypto.randomUUID();

async function editBuffer(
	denops: Denops,
	bufnr: number,
	func: (denops: Denops) => Promise<void>,
) {
	await locker.acquire(`${bufnr}:${locker_id}`, async () => {
		await batch.batch(denops, async (denops) => {
			await fn.setbufvar(denops, bufnr, "&ma", 1);
			await func(denops);
			await fn.setbufvar(denops, bufnr, "&ma", 0);
		});
	});
}

import type { Status } from "./masto.d.ts";

type WinSaveView = {
	lnum: number;
	col: number;
	coladd: number;
	curswant: number;
	topline: number;
	topfill: number;
	leftcol: number;
	skipcol: number;
};

interface LoadMore {
	createdAt: string;
	id: string;
}

/**
 * LOAD MOREもしくはStatus
 */
interface StatusOrLoadMore<
	T extends "Status" | "LoadMore" = "Status" | "LoadMore",
> {
	/**
	 * Status か LoadMoreの実体
	 */
	type: T;
	data: T extends "Status" ? Status : LoadMore;
}

/**
 * タイムラインのレンダーを引き受ける構造体
 */
export class TimelineRenderer {
	private _statuses: StatusOrLoadMore[] = [];
	private bufnr: number;
	private constructor(bufnr: number) {
		this.bufnr = bufnr;
	}
	/**
	 * バッファに紐ついているStatus一覧
	 */
	get statuses() {
		return this._statuses;
	}
	/**
	 * 現在のバッファを初期設定する
	 */
	public static async setupCurrentBuffer(
		denops: Denops,
	): Promise<TimelineRenderer> {
		const bufnr = await (denops.call("bufnr") as Promise<number>);
		batch.batch(denops, async (denops) => {
			await denops.cmd("setl bt=nofile noswf noma nowrap ft=markdown");
			await denops.cmd("syntax match Author /^↳\\?\\zs.\\{-}:\\ /");
			await denops.cmd("syntax match MstdnLoadMore /^(LOAD MORE)$/");
			await denops.cmd("highlight link Author Comment");
			await denops.cmd("highlight link MstdnLoadMore WildMenu");
			await denops.cmd("sign define fav text=▸ texthl=MstdnFavourite");
		});
		return new TimelineRenderer(bufnr);
	}
	/**
	 * 「さらに読み込む」マークを先頭に挿入する
	 */
	public async addLoadMore(denops: Denops) {
		const lastStatus = this._statuses.at(0);
		if (lastStatus?.type === "LoadMore") return;
		const createdAt =
			lastStatus !== undefined
				? lastStatus.data.createdAt
				: new Date(0).toISOString();
		const item: StatusOrLoadMore = {
			type: "LoadMore",
			data: {
				createdAt,
				id: self.crypto.randomUUID(),
			},
		};
		const text = render(item);
		const target_idx = 0; // zero-indexed
		if (this._statuses.length === 0) {
			// 最初
			await editBuffer(denops, this.bufnr, async (denops) => {
				await fn.setbufline(denops, this.bufnr, target_idx + 1, text);
				this._statuses = [item];
			});
		} else if (this._statuses[0] !== null) {
			await editBuffer(denops, this.bufnr, async (denops) => {
				await fn.appendbufline(denops, this.bufnr, target_idx, text);
				this._statuses.splice(target_idx, 0, item);
			});
		}
	}
	/**
	 * 指定したIDのLOAD MOREの前後のStatusを取得する
	 */
	public loadMoreInfo(id: string): {
		/**
		 * LOAD MORE直前の投稿
		 */
		prev: Status | null;
		/**
		 * LOAD MORE直後の投稿
		 */
		next: Status | null;
	} {
		const index = this._statuses.findIndex(
			(item) => item.type === "LoadMore" && item.data.id === id,
		);
		if (index === -1) {
			throw new Error("loadMore not found");
		}
		const n = (
			index !== 0 ? this._statuses[index - 1] : null
		) as StatusOrLoadMore<"Status"> | null;
		const next = n === null ? null : n.data;
		const p = (
			index + 1 < this._statuses.length ? this._statuses[index + 1] : null
		) as StatusOrLoadMore<"Status"> | null;
		const prev = p === null ? null : p.data;
		return { next, prev };
	}
	/**
	 * 適切な位置に投稿を挿入または更新する。
	 */
	public async add(
		denops: Denops,
		statuses: Status[],
		opts: {
			update_only?: boolean | undefined;
		} = {},
	) {
		/**
		 * 変更の最下部行。自動スクロールの発火判定に用いる
		 */
		let changeBottomIdx = 0;
		function sorter(l: StatusOrLoadMore, r: StatusOrLoadMore) {
			const diff = Date.parse(r.data.createdAt) - Date.parse(l.data.createdAt);
			if (diff !== 0) return diff;
			if (r.type === "LoadMore") return 1;
			return r.data.id.localeCompare(l.data.id);
		}
		/**
		 * 配列済み配列をマージする
		 */
		function merge(update: StatusOrLoadMore[], old: StatusOrLoadMore[]) {
			const results = [];
			while (update.length && old.length) {
				const diff = sorter(update[0], old[0]);

				if (diff <= 0) {
					if (update[0].data.id === old[0].data.id) {
						old.shift();
					} else if (opts.update_only) {
						update.shift();
					}
					results.push(update.shift() as StatusOrLoadMore);
				} else {
					results.push(old.shift() as StatusOrLoadMore);
				}
			}
			changeBottomIdx = results.length + update.length - 1;
			return [...results, ...update, ...old];
		}
		this._statuses = merge(
			statuses
				.map((data) => {
					const sol: StatusOrLoadMore<"Status"> = {
						data,
						type: "Status",
					};
					return sol;
				})
				.sort(sorter),
			this._statuses,
		);
		const [view, bufnr] = await batch.collect(denops, (denops) => [
			fn.winsaveview(denops) as Promise<WinSaveView>,
			denops.eval("winbufnr(winnr())") as Promise<number>,
		]);
		if (this.bufnr === bufnr) {
			// 現在そのウィンドウにいるとき
			if (
				changeBottomIdx + 1 < view.lnum &&
				!(changeBottomIdx === 0 && view.topline === 1)
			) {
				// カーソル位置より上部のとき、ただし画面一番上にいるときは自動スクロール
				view.lnum += 1;
				view.topline += 1;
			}
		}
		await this.redraw(denops, view);
	}

	/**
	 * 再描画
	 */
	public async redraw(denops: Denops, view?: WinSaveView) {
		const favitems = this._statuses.flatMap((v, i) =>
			v.type === "Status" && ((v.data as Status).favourited ?? false)
				? [
						{
							buffer: this.bufnr,
							name: "fav",
							lnum: i + 1,
						},
					]
				: [],
		);
		const lines = this._statuses.map(render);
		const [v, bufnr] = await batch.collect(denops, (denops) => [
			fn.winsaveview(denops) as Promise<WinSaveView>,
			denops.eval("winbufnr(winnr())") as Promise<number>,
		]);
		await batch.batch(denops, async (denops) => {
			await editBuffer(denops, this.bufnr, async (denops) => {
				await denops.cmd(`sil! cal deletebufline(${this.bufnr}, 1, '$')`);
				await fn.setbufline(denops, this.bufnr, 1, lines);
				if (bufnr === this.bufnr) {
					// 現在のバッファにいる時は閲覧画面を維持する
					// TODO: Window-local varとwin_execute()など用いてWindowから離れている時もwinrestviewをする仕組み
					await fn.winrestview(denops, view ?? v);
				}
			});
			await denops.call("sign_placelist", favitems);
		});
	}
	/**
	 * 投稿やLOAD MOREを削除する
	 */
	public async delete(denops: Denops, id: string): Promise<boolean> {
		const target_idx = this._statuses.findIndex((st) => st.data.id === id);
		if (target_idx === -1) return false;
		await batch.batch(denops, async (denops) => {
			await editBuffer(denops, this.bufnr, async (denops) => {
				await fn.deletebufline(denops, this.bufnr, target_idx + 1);
				this._statuses.splice(target_idx, 1);
			});
		});
		return true;
	}
}

const turndownService = new TurndownService();
function render(item: StatusOrLoadMore<"Status" | "LoadMore">): string {
	if (item.type === "LoadMore") {
		// 接続が切れていた行
		return "(LOAD MORE)";
	}
	const data = item.data as Status;
	const ACCOUNT_LENGTH = 10;
	const spaces = ACCOUNT_LENGTH - data.account.username.length;
	const username = `${"-".repeat(Math.max(spaces, 0))}@${
		spaces < 0
			? `${data.account.username.slice(0, ACCOUNT_LENGTH - 1)}…`
			: data.account.username
	}`;
	let content = turndownService.turndown(data.content).replaceAll("~", "\\~");
	// .replace(/\r?\n+/g, " ")
	// .replace("\r", " ");
	function formatDateTime(time: string) {
		return new Date(Date.parse(time)).toLocaleString();
	}
	if (data.editedAt) {
		content += ` <!-- edited at ${formatDateTime(data.editedAt)} -->`;
	} else {
		content += ` <!-- ${formatDateTime(data.createdAt)} -->`;
	}
	const img_count = data.mediaAttachments.filter(
		(v) => v.type === "image",
	).length;
	const img = img_count > 0 ? `\udb80\udee9 ${img_count} ` : "----";
	const isReply = data.inReplyToId ? "↳ " : "--";
	return `${isReply}${img}${username}: ${content}`;
}
