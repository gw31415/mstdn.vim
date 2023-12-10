import * as batch from "https://deno.land/x/denops_std@v5.1.0/batch/mod.ts";
import { Denops } from "https://deno.land/x/denops_std@v5.1.0/mod.ts";
import { datetime } from "https://deno.land/x/ptera@v1.0.2/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v5.1.0/function/mod.ts";

import TurndownService from "npm:turndown";
import { Status } from "./masto.d.ts";

interface StatusOrLoadMore<T extends Status | null> {
  status: T;
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
      await batch.batch(denops, async (denops) => {
        await fn.setbufvar(denops, this.bufnr, "&ma", 1);
        await fn.setbufline(denops, this.bufnr, target_idx + 1, text);
        this._statuses = [item];
        await fn.setbufvar(denops, this.bufnr, "&ma", 0);
      });
    } else if (this._statuses[0] !== null) {
      await batch.batch(denops, async (denops) => {
        await fn.setbufvar(denops, this.bufnr, "&ma", 1);
        await fn.appendbufline(denops, this.bufnr, target_idx, text);
        this._statuses.splice(target_idx, 0, item);
        await fn.setbufvar(denops, this.bufnr, "&ma", 0);
      });
    }
  }
  public async removeLoadMore(denops: Denops, id: string): Promise<boolean> {
    const target_idx = this._statuses.findIndex((item) => item.id === id);
    if (target_idx === -1) {
      return false;
    }
    await batch.batch(denops, async (denops) => {
      await fn.setbufvar(denops, this.bufnr, "&ma", 1);
      await fn.deletebufline(denops, this.bufnr, target_idx + 1);
      this._statuses.splice(target_idx, 1);
      await fn.setbufvar(denops, this.bufnr, "&ma", 0);
    });
    return true;
  }
  public loadMoreInfo(id: string): {
    prev: Status | null;
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
  public async add(denops: Denops, status: Status) {
    // zero-indexed
    const sameStatusIdx = this._statuses.findIndex(
      (item) => item.status !== null && item.status.id === status.id,
    );
    const item = {
      id: null,
      status,
    };
    const text = render(item);
    if (sameStatusIdx !== -1) {
      // Statusが被っていた場合(editedなど)
      const target_idx = sameStatusIdx; // zero-indexed
      await batch.batch(denops, async (denops) => {
        await fn.setbufvar(denops, this.bufnr, "&ma", 1);
        await fn.setbufline(denops, this.bufnr, target_idx + 1, text);
        this._statuses.splice(target_idx, 1, item);
        await fn.setbufvar(denops, this.bufnr, "&ma", 0);
      });
    } else {
      // Statusが被っていなかった場合
      // zero-indexed
      const lastStatusIdx = this._statuses.findLastIndex(
        (st) =>
          st.status !== null &&
          datetime(item.status.createdAt).isBefore(
            datetime(st.status.createdAt),
          ),
      ) + 1;
      const target_idx = lastStatusIdx !== -1
        ? lastStatusIdx
        : this._statuses.length;

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
      const [view, bufnr] = await batch.collect(denops, (denops) => [
        fn.winsaveview(denops) as Promise<WinSaveView>,
        denops.eval("winbufnr(winnr())") as Promise<number>,
      ]);
      if (
        target_idx + 1 < view.lnum &&
        !(target_idx === 0 && view.topline === 1)
      ) {
        // カーソル位置より上部のとき、ただし画面一番上にいるときは自動スクロール
        view.lnum += 1;
        view.topline += 1;
      }
      await batch.batch(denops, async (denops) => {
        await fn.setbufvar(denops, this.bufnr, "&ma", 1);
        // target_idx+1 行目になるよう挿入される
        await fn.appendbufline(denops, this.bufnr, target_idx, text);
        if (bufnr === this.bufnr) {
          // 現在のバッファにいる時は閲覧画面を維持する
          // TODO: Window-local varなど用いてWindowから離れている時もwinrestviewをする仕組み
          await fn.winrestview(denops, view);
        }
        this._statuses.splice(target_idx, 0, item);
        await fn.setbufvar(denops, this.bufnr, "&ma", 0);
      });
    }
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
      await fn.setbufvar(denops, this.bufnr, "&ma", 1);
      await fn.deletebufline(denops, this.bufnr, target_idx + 1);
      this._statuses.splice(target_idx, 1);
      await fn.setbufvar(denops, this.bufnr, "&ma", 0);
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
    return datetime(time).toLocal().toISO();
  }
  if (item.status.editedAt) {
    content = `${content} <!-- edited at ${
      formatDateTime(
        item.status.editedAt,
      )
    } -->`;
  } else {
    content = `${content} <!-- ${formatDateTime(item.status.createdAt)} -->`;
  }
  return `${username}: ${content}`;
}
