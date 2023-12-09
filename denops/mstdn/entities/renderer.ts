import * as batch from "https://deno.land/x/denops_std@v5.1.0/batch/mod.ts";
import { Denops } from "https://deno.land/x/denops_std@v5.1.0/mod.ts";
import { datetime } from "https://deno.land/x/ptera@v1.0.2/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v5.1.0/function/mod.ts";

import TurndownService from "npm:turndown";
import { Status } from "./masto.d.ts";

/**
 * タイムラインのレンダーを引き受ける構造体
 */
export class TimelineRenderer {
  private _statuses: Status[] = [];
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
      await denops.cmd("highlight link Author MstdnUsername");
    });
    return new TimelineRenderer(bufnr);
  }
  /**
   * 適切な位置に投稿を挿入または更新する。
   */
  public async add(denops: Denops, ...statuses: Status[]) {
    for (const status of statuses) {
      const sameStatusIdx = this._statuses.findIndex(
        (st) => st.id === status.id,
      );
      const text = render(status);
      if (sameStatusIdx !== -1) {
        // Statusが被っていた場合(editedなど)
        const target_idx = sameStatusIdx;
        await batch.batch(denops, async (denops) => {
          await fn.setbufvar(denops, this.bufnr, "&ma", 1);
          await fn.setbufline(denops, this.bufnr, target_idx + 1, text);
          this._statuses.splice(target_idx, 1, status);
          await fn.setbufvar(denops, this.bufnr, "&ma", 0);
        });
      } else {
        // Statusが被っていなかった場合
        const lastStatusIdx = this._statuses.findIndex((st) =>
          datetime(status.createdAt).isAfter(datetime(st.createdAt))
        );
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
        const view = (await fn.winsaveview(denops)) as WinSaveView;
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
          await fn.winrestview(denops, view);
          this._statuses.splice(target_idx, 0, status);
          await fn.setbufvar(denops, this.bufnr, "&ma", 0);
        });
      }
    }
  }
  /**
   * 投稿を削除する
   */
  public async delete(denops: Denops, id: string) {
    const target_row = this._statuses.findIndex((st) => st.id === id);
    if (target_row === -1) {
      return;
    }
    await batch.batch(denops, async (denops) => {
      await fn.setbufvar(denops, this.bufnr, "&ma", 1);
      await fn.deletebufline(denops, this.bufnr, target_row + 1);
      this._statuses.splice(target_row, 1);
      await fn.setbufvar(denops, this.bufnr, "&ma", 0);
    });
  }
}

const turndownService = new TurndownService();
function render(status: Status): string {
  const ACCOUNT_LENGTH = 10;
  const spaces = ACCOUNT_LENGTH - status.account.username.length;
  const username = `${"-".repeat(Math.max(spaces, 0))}@${
    spaces < 0
      ? `${status.account.username.slice(0, ACCOUNT_LENGTH - 1)}…`
      : status.account.username
  }`;
  let content = turndownService
    .turndown(status.content)
    .replace(/\r?\n+/, " ")
    .replace("\r", " ");
  function formatDateTime(time: string) {
    return datetime(time).toLocal().toISO();
  }
  if (status.editedAt) {
    content = `${content} <!-- edited at ${
      formatDateTime(
        status.editedAt,
      )
    } -->`;
  } else {
    content = `${content} <!-- ${formatDateTime(status.createdAt)} -->`;
  }
  return `${username}: ${content}`;
}
