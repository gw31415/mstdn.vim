import camelcaseKeys from "npm:camelcase-keys";
import { isNumber, isString } from "jsr:@core/unknownutil";
import type { Denops } from "jsr:@denops/std";
import * as autocmd from "jsr:@denops/std/autocmd";
import * as batch from "jsr:@denops/std/batch";
import type { CreateStatusParams, Status } from "./entities/masto.d.ts";
import {
	TimelineRenderer,
	User,
	listLoginUsers,
	login,
	logout,
	parseUri,
	vim,
} from "./entities/mod.ts";

const BUFFERS = new Map<
	number,
	{
		user: User;
		renderer: TimelineRenderer;
	}
>();

function deleteBuffer(bufnr: unknown) {
	if (!isNumber(bufnr)) {
		throw new Error("not number value");
	}
	const b = BUFFERS.get(bufnr);
	if (b) {
		b.user.close(bufnr);
	}
	BUFFERS.delete(bufnr);
}

async function handleError(denops: Denops, e: unknown) {
	const message = e instanceof Error ? e.message : `${e}`;
	await vim.msg(denops, message, { level: "ERROR" });
}

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
		]);
	});
	denops.dispatcher = {
		async requestMstdn(user, endpoint, method, body) {
			try {
				if (!isString(endpoint) || !isString(method) || !isString(user)) {
					throw new Error("not string value");
				}
				const u = new User(user);
				const res = await u.rest(endpoint, method, body);
				if (/^\/api\/v1\/statuses\/\d+\/(un)?favourite$/g.test(endpoint)) {
					// いいね関連リクエストのための特別処理
					// 他のTLも更新されるようにする
					const status: Status = camelcaseKeys(JSON.parse(res));
					const renderers = Array.from(BUFFERS.values()).flatMap(
						({ user: u, renderer }) =>
							u.toString() === user ? [renderer] : [],
					);
					for (const renderer of renderers) {
						renderer.add(denops, [status], {
							update_only: true,
						});
					}
				}
			} catch (e) {
				await handleError(denops, e);
			}
		},
		user(bufnr): string {
			if (!isNumber(bufnr)) {
				throw new Error("not number value");
			}
			const b = BUFFERS.get(bufnr);
			if (!b) {
				throw new Error(`buf numbered ${bufnr} is not mstdn buffer`);
			}
			return b.user.toString();
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
			if (!item || item.data === null) {
				throw new Error("index is not valid");
			}
			return item.data?.id;
		},
		getStatus(index, bufnr) {
			if (!isNumber(bufnr) || !isNumber(index)) {
				throw new Error("not number value");
			}
			const b = BUFFERS.get(bufnr);
			if (!b) {
				throw new Error(`buf numbered ${bufnr} is not mstdn buffer`);
			}
			const item = b.renderer.statuses.at(index);
			if (!item || item.data === null) {
				throw new Error("index is not valid");
			}
			if (item.type === "LoadMore") {
				throw new Error("LOAD_MORE is not status item");
			}
			return item.data;
		},
		timelines(): number[] {
			return Array.from(BUFFERS.keys());
		},
		getStatusDefaults(bufnr): CreateStatusParams {
			if (!isNumber(bufnr)) {
				throw new Error("not number value");
			}
			const buffer = BUFFERS.get(bufnr);
			if (buffer) {
				return buffer.user.timelineStatusDefaults(bufnr);
			}
			return { status: "" };
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
				await handleError(denops, e);
			}
		},
		deleteBuffer,
		async reconnectAll() {
			try {
				for (const [_, b] of BUFFERS) {
					if (b.user.status === "CLOSED") {
						b.user.reconnect();
					}
				}
			} catch (e) {
				await handleError(denops, e);
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
				b.user.reconnect();
			} catch (e) {
				await handleError(denops, e);
			}
		},
		async redrawBuffer(bufnr) {
			try {
				if (!isNumber(bufnr)) {
					throw new Error("not number value");
				}
				const b = BUFFERS.get(bufnr);
				if (!b) {
					throw new Error(`buf numbered ${bufnr} is not mstdn buffer`);
				}
				await b.renderer.redraw(denops);
			} catch (e) {
				await handleError(denops, e);
			}
		},
		async loadMore(index, bufnr) {
			try {
				if (!isNumber(bufnr) || !isNumber(index)) {
					throw new Error("not number value");
				}
				const b = BUFFERS.get(bufnr);
				if (!b) {
					throw new Error(`buf numbered ${bufnr} is not mstdn buffer`);
				}
				const status = b.renderer.statuses.at(index);
				if (!status || status.type !== "LoadMore") {
					throw new Error("index is not valid");
				}
				const info = b.renderer.loadMoreInfo(status.data.id);
				if (b.user.status === "CLOSED") {
					b.user.reconnect();
				}
				const statuses = await b.user.fetch(bufnr, {
					before: info.next ?? undefined,
				});
				if (
					info.prev !== null &&
					-1 !== statuses.findIndex((st) => st.id === info.prev?.id)
				) {
					// 取得がloadMoreを追い越した時
					await b.renderer.delete(denops, status.data.id);
				}
			} catch (e) {
				await handleError(denops, e);
			}
		},
		async loadBuffer() {
			try {
				const [bufname, bufnr] = await batch.collect(denops, (denops) => [
					denops.call("bufname") as Promise<string>,
					denops.call("bufnr") as Promise<number>,
				]);
				if (BUFFERS.has(bufnr)) {
					deleteBuffer(bufnr);
				}
				const renderer = await TimelineRenderer.setupCurrentBuffer(denops);
				const uri = parseUri(bufname);
				uri.user.subscribe({
					id: bufnr,
					method: uri.method,
					callbacks: {
						onCreatingSocket() {
							vim.msg(denops, "Connecting....", {
								level: "INFO",
							});
						},
						async onOpen() {
							await batch.batch(denops, async (denops) => {
								await vim.msg(denops, "Connected.", {
									level: "INFO",
								});
								await renderer.addLoadMore(denops);
							});
							await uri.user.fetch(bufnr);
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
							await renderer.add(denops, [status]);
						},
						async onDelete(id) {
							await renderer.delete(denops, id);
						},
						async onUpdate(...status) {
							await renderer.add(denops, status);
						},
					},
				});
				if (uri.user.status !== "OPEN") {
					uri.user.connect();
				}
				BUFFERS.set(bufnr, { user: uri.user, renderer });
			} catch (e) {
				await handleError(denops, e);
			}
		},
	};
}
