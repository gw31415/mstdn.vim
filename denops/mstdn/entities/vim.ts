import * as helper from "jsr:@denops/std/helper";
import type { Denops } from "jsr:@denops/std";

/**
 * メッセージを表示する
 */
export async function msg(
	denops: Denops,
	message: string,
	opts: { level: "INFO" | "ERROR" },
) {
	if (denops.meta.host === "nvim") {
		await denops.call("nvim_notify", message, opts.level === "INFO" ? 2 : 4, {
			title: "mstdn.vim", // for nvim-notify
			annote: "mstdn.vim", // for fidget.vim
		});
	} else {
		const msg = `mstdn.vim: ${message}`;
		if (opts.level === "INFO") {
			await helper.echo(denops, msg);
		} else {
			await helper.echoerr(denops, msg);
		}
	}
}
