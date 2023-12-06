import { Denops } from "https://deno.land/x/denops_std@v5.1.0/mod.ts";

export async function main(denops: Denops): Promise<void> {
	console.log(denops.name);
}
