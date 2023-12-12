import * as batch from "https://deno.land/x/denops_std@v5.1.0/batch/mod.ts";
import { Denops } from "https://deno.land/x/denops_std@v5.1.0/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v5.1.0/function/mod.ts";
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

import { Status } from "./masto.d.ts";

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

/**
 * LOAD MOREもしくはStatus
 */
interface StatusOrLoadMore<T extends Status | null> {
	/**
	 * Status
	 */
	status: T;
	/**
	 * LOAD MOREのID
	 */
	id: T extends null ? string : null;
}

/**
 * タイムラインのレンダーを引き受ける構造体
 */
export class TimelineRenderer {
	private _statuses: StatusOrLoadMore<Status | null>[] = [];
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
			await denops.cmd("syntax match Author /^.\\{-}:\\ /");
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
	public async insertLoadMore(denops: Denops) {
		const item: StatusOrLoadMore<null> = {
			status: null,
			id: self.crypto.randomUUID(),
		};
		self.crypto.randomUUID();
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
	 * 指定したIDのLOAD MOREを削除する
	 */
	public async removeLoadMore(denops: Denops, id: string): Promise<boolean> {
		const target_idx = this._statuses.findIndex((item) => item.id === id);
		if (target_idx === -1) {
			return false;
		}
		await editBuffer(denops, this.bufnr, async (denops) => {
			await fn.deletebufline(denops, this.bufnr, target_idx + 1);
			this._statuses.splice(target_idx, 1);
		});
		return true;
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
		const index = this._statuses.findIndex((item) => item.id === id);
		if (index === -1) {
			throw new Error("loadMore not found");
		}
		const n = this._statuses.at(index - 1) ?? null;
		const next = n === null ? null : n.status;
		const p = this._statuses.at(index + 1) ?? null;
		const prev = p === null ? null : p.status;
		return { next, prev };
	}
	/**
	 * 適切な位置に投稿を挿入または更新する。
	 */
	public async add(denops: Denops, ...statuses: Status[]) {
		/**
		 * 変更の最下部行。自動スクロールの発火判定に用いる
		 */
		let changeBottomIdx = 0;
		for (const status of statuses) {
			const item = {
				id: null,
				status,
			};
			// zero-indexed
			const sameStatusIdx = this._statuses.findIndex(
				(item) => item.status !== null && item.status.id === status.id,
			);
			if (sameStatusIdx !== -1) {
				this._statuses.splice(sameStatusIdx, 1, item);
				changeBottomIdx = Math.max(sameStatusIdx, changeBottomIdx);
			} else {
				const lastStatusIdx =
					this._statuses.findLastIndex(
						(st) =>
							st.status !== null &&
							Date.parse(item.status.createdAt) <
								Date.parse(st.status.createdAt),
					) + 1;
				const targetIdx =
					lastStatusIdx !== -1 ? lastStatusIdx : this._statuses.length;
				this._statuses.splice(targetIdx, 0, item);
				changeBottomIdx = Math.max(targetIdx, changeBottomIdx);
			}
		}
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
			v.status !== null && (v.status.favourited ?? false)
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
	 * 投稿を削除する
	 */
	public async delete(denops: Denops, id: string) {
		const target_idx = this._statuses.findIndex(
			(st) => st !== null && st.id === id,
		);
		if (target_idx === -1) {
			return;
		}
		await batch.batch(denops, async (denops) => {
			await editBuffer(denops, this.bufnr, async (denops) => {
				await fn.deletebufline(denops, this.bufnr, target_idx + 1);
				this._statuses.splice(target_idx, 1);
			});
		});
	}
}

const turndownService = new TurndownService();
function render(item: StatusOrLoadMore<Status | null>): string {
	if (item.status === null) {
		// 接続が切れていた行
		return "(LOAD MORE)";
	}
	const ACCOUNT_LENGTH = 10;
	const spaces = ACCOUNT_LENGTH - item.status.account.username.length;
	const username = `${"-".repeat(Math.max(spaces, 0))}@${
		spaces < 0
			? `${item.status.account.username.slice(0, ACCOUNT_LENGTH - 1)}…`
			: item.status.account.username
	}`;
	let content = turndownService
		.turndown(item.status.content)
		.replace(/\r?\n+/, " ")
		.replace("\r", " ");
	function formatDateTime(time: string) {
		return new Date(Date.parse(time)).toLocaleString();
	}
	if (item.status.editedAt) {
		content = `${content} <!-- edited at ${formatDateTime(
			item.status.editedAt,
		)} -->`;
	} else {
		content = `${content} <!-- ${formatDateTime(item.status.createdAt)} -->`;
	}
	return `${username}: ${content}`;
}
