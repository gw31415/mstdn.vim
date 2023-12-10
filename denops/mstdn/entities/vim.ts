import * as helper from "https://deno.land/x/denops_std@v5.1.0/helper/mod.ts";
import { Denops } from "https://deno.land/x/denops_std@v5.1.0/mod.ts";

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
