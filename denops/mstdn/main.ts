import * as autocmd from "https://deno.land/x/denops_std@v5.1.0/autocmd/mod.ts";
import * as batch from "https://deno.land/x/denops_std@v5.1.0/batch/mod.ts";
import { Denops } from "https://deno.land/x/denops_std@v5.1.0/mod.ts";
import {
  isNumber,
  isString,
} from "https://deno.land/x/unknownutil@v3.10.0/mod.ts#^.ts";
import {
  listLoginUsers,
  login,
  MstdnSocket,
  TimelineRenderer,
  vim,
} from "./entities/mod.ts";

const BUFFERS = new Map<
  number,
  {
    socket: MstdnSocket;
    renderer: TimelineRenderer;
  }
>();
Deno.addSignalListener("SIGINT", () => {
  for (const [_, b] of BUFFERS) {
    b.socket.close();
  }
});

export async function main(denops: Denops): Promise<void> {
  await batch.batch(denops, async (denops) => {
    await Promise.all([
      autocmd.define(
        denops,
        "BufReadCmd",
        "mstdn://*",
        `call denops#notify("${denops.name}", "loadBuffer", [])`,
      ),
      autocmd.define(
        denops,
        "BufDelete",
        "*",
        `call denops#notify("${denops.name}", "clearBuffer", [str2nr(expand("<abuf>"))])`,
      ),
      denops.cmd("highlight MstdnUsername gui=italic guifg=#5c6370"),
    ]);
  });
  denops.dispatcher = {
    timelines(): number[] {
      return Array.from(BUFFERS.keys());
    },
    loginUsers(): string[] {
      return listLoginUsers().map(
        ({ server, username }) => `${username}@${server}`,
      );
    },
    async login(server, token) {
      try {
        if (!isString(token) || !isString(server)) {
          throw new Error("not string value");
        }
        await login({
          token,
          server,
        });
      } catch (e) {
        await vim.msg(denops, `${e.message ?? e}`, { level: "ERROR" });
      }
    },
    clearBuffer(bufnr) {
      if (!isNumber(bufnr)) {
        throw new Error("not number value");
      }
      const b = BUFFERS.get(bufnr);
      if (b) {
        b.socket.close();
      }
      BUFFERS.delete(bufnr);
    },
    reconnectAll() {
      try {
        for (const [_, b] of BUFFERS) {
          if (b.socket.status === "CLOSED") {
            b.socket.reconnect();
          }
        }
      } catch (e) {
        vim.msg(denops, `${e.message ?? e}`, { level: "ERROR" });
      }
    },
    async reconnectBuffer(bufnr) {
      try {
        if (!isNumber(bufnr)) {
          throw new Error("not number value");
        }
        const b = BUFFERS.get(bufnr);
        if (!b) {
          throw new Error(`buf numbered ${bufnr} is not mstdn buffer`);
        }
        b.socket.reconnect();
      } catch (e) {
        await vim.msg(denops, `${e.message ?? e}`, { level: "ERROR" });
      }
    },
    async fetchMore(bufnr) {
      try {
        if (!isNumber(bufnr)) {
          throw new Error("not number value");
        }
        const b = BUFFERS.get(bufnr);
        if (!b) {
          throw new Error(`buf numbered ${bufnr} is not mstdn buffer`);
        }
        if (b.socket.status === "CLOSED") {
          b.socket.reconnect();
        }
        const statuses = b.renderer.statuses;
        b.socket.fetch({
          before:
            statuses.length !== 0 ? statuses[statuses.length - 1] : undefined,
        });
      } catch (e) {
        await vim.msg(denops, `${e.message ?? e}`, { level: "ERROR" });
      }
    },
    async loadBuffer() {
      try {
        const [bufname, bufnr] = await batch.collect(denops, (helper) => [
          helper.call("bufname") as Promise<string>,
          helper.call("bufnr") as Promise<number>,
        ]);
        const renderer = await TimelineRenderer.setupCurrentBuffer(denops);
        const socket = new MstdnSocket(bufname, {
          onOpen() {
            vim.msg(denops, "Connecting....", { level: "INFO" });
          },
          onInitialized() {
            vim.msg(denops, "Connected.", { level: "INFO" });
          },
          onError(ev) {
            vim.msg(denops, `${ev}`, { level: "ERROR" });
          },
          async onStatusUpdate(status) {
            await renderer.add(denops, status);
          },
          async onDelete(id) {
            await renderer.delete(denops, id);
          },
          async onUpdate(status) {
            await renderer.add(denops, status);
          },
        });
        BUFFERS.set(bufnr, { socket, renderer });
      } catch (e) {
        await batch.batch(denops, async (denops) => {
          await Promise.all([
            vim.msg(denops, `${e.message ?? e}`, { level: "ERROR" }),
            denops.cmd("bd"),
          ]);
        });
      }
    },
  };
}
