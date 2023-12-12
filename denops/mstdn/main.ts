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
	logout,
	MstdnSocket,
	TimelineRenderer,
	vim,
} from "./entities/mod.ts";
import { Status } from "./entities/masto.d.ts";
import camelcaseKeys from "npm:camelcase-keys";

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
				`call denops#notify("${denops.name}", "deleteBuffer", [str2nr(expand("<abuf>"))])`,
			),
			denops.cmd(
				"highlight MstdnFavourite ctermfg=217 gui=bold guifg=#e86671",
			),
		]);
	});
	denops.dispatcher = {
		async requestMstdnCommitSingleStatus(endpoint, method, body, bufnr) {
			try {
				if (!isString(endpoint) || !isString(method)) {
					throw new Error("not string value");
				}
				if (!isNumber(bufnr)) {
					throw new Error("not number value");
				}
				const b = BUFFERS.get(bufnr);
				if (!b) {
					throw new Error(
						`buf numbered ${bufnr} is not mstdn buffer`,
					);
				}
				const res = await fetch(
					new URL(`https://${b.socket.uri.user.server}${endpoint}`),
					{
						method,
						body: JSON.stringify(body),
						headers: {
							Authorization: `Bearer ${b.socket.uri.user.token}`,
							"Content-type": "application/json",
						},
					},
				);
				const data = camelcaseKeys(JSON.parse(await res.text()));
				if (res.status === 200) {
					const newStatus: Status = data;
					b.renderer.add(denops, newStatus);
				} else {
					throw new Error(`${data.error}`);
				}
			} catch (e) {
				await vim.msg(denops, `${e.message ?? e}`, { level: "ERROR" });
			}
		},
		getStatusId(index, bufnr): string | undefined {
			if (!isNumber(bufnr) || !isNumber(index)) {
				throw new Error("not number value");
			}
			const b = BUFFERS.get(bufnr);
			if (!b) {
				throw new Error(`buf numbered ${bufnr} is not mstdn buffer`);
			}
			const item = b.renderer.statuses.at(index);
			if (!item || item.status === null) {
				throw new Error("index is not valid");
			}
			return item.status?.id;
		},
		timelines(): number[] {
			return Array.from(BUFFERS.keys());
		},
		loginUsers(): string[] {
			return listLoginUsers().map(
				({ server, username }) => `${username}@${server}`,
			);
		},
		logout(username, server) {
			if (!isString(username) || !isString(server)) {
				throw new Error("not string value");
			}
			logout({ username, server });
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
		deleteBuffer(bufnr) {
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
					throw new Error(
						`buf numbered ${bufnr} is not mstdn buffer`,
					);
				}
				b.socket.reconnect();
			} catch (e) {
				await vim.msg(denops, `${e.message ?? e}`, { level: "ERROR" });
			}
		},
		async redrawBuffer(bufnr) {
			try {
				if (!isNumber(bufnr)) {
					throw new Error("not number value");
				}
				const b = BUFFERS.get(bufnr);
				if (!b) {
					throw new Error(
						`buf numbered ${bufnr} is not mstdn buffer`,
					);
				}
				await b.renderer.redraw(denops);
			} catch (e) {
				await vim.msg(denops, `${e.message ?? e}`, { level: "ERROR" });
			}
		},
		async loadMore(index, bufnr) {
			try {
				if (!isNumber(bufnr) || !isNumber(index)) {
					throw new Error("not number value");
				}
				const b = BUFFERS.get(bufnr);
				if (!b) {
					throw new Error(
						`buf numbered ${bufnr} is not mstdn buffer`,
					);
				}
				const status = b.renderer.statuses.at(index);
				if (!status || status.id === null) {
					throw new Error("index is not valid");
				}
				const info = b.renderer.loadMoreInfo(status.id);
				if (b.socket.status === "CLOSED") {
					b.socket.reconnect();
				}
				const statuses = await b.socket.fetch({
					before: info.next ?? undefined,
				});
				if (
					info.prev !== null &&
					-1 !== statuses.findIndex((st) => st.id === info.prev?.id)
				) {
					// 取得がloadMoreを追い越した時
					await b.renderer.removeLoadMore(denops, status.id);
				}
			} catch (e) {
				await vim.msg(denops, `${e.message ?? e}`, { level: "ERROR" });
			}
		},
		async loadBuffer() {
			try {
				const [bufname, bufnr] = await batch.collect(
					denops,
					(denops) => [
						denops.call("bufname") as Promise<string>,
						denops.call("bufnr") as Promise<number>,
					],
				);
				const renderer = await TimelineRenderer.setupCurrentBuffer(
					denops,
				);
				const socket = new MstdnSocket(bufname, {
					onCreatingSocket() {
						vim.msg(denops, "Connecting....", { level: "INFO" });
					},
					async onOpen() {
						await batch.batch(denops, async (denops) => {
							await vim.msg(denops, "Connected.", {
								level: "INFO",
							});
							await renderer.insertLoadMore(denops);
						});
						await socket.fetch();
					},
					onError(ev) {
						vim.msg(
							denops,
							`${(ev as ErrorEvent).message ?? ev.toString()}`,
							{
								level: "ERROR",
							},
						);
					},
					async onStatusUpdate(status) {
						await renderer.add(denops, status);
					},
					async onDelete(id) {
						await renderer.delete(denops, id);
					},
					async onUpdate(...status) {
						await renderer.add(denops, ...status);
					},
				});
				socket.connect();
				BUFFERS.set(bufnr, { socket, renderer });
			} catch (e) {
				await batch.batch(denops, async (denops) => {
					await Promise.all([
						vim.msg(denops, `${e.message ?? e}`, {
							level: "ERROR",
						}),
					]);
				});
			}
		},
	};
}
