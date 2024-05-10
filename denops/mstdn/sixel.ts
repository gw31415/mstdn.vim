import {
	createCanvas,
	loadImage,
} from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { image2sixel } from "npm:sixel";

export async function img2sixel(
	source: string,
	opts?:
		| {
			maxWidth?: number;
			maxHeight?: number;
		}
		| undefined,
): Promise<{
	data: string;
	height: number;
	width: number;
}> {
	const img = await loadImage(source);
	let [width, height] = [img.width(), img.height()];
	if (opts?.maxWidth && opts?.maxHeight) {
		const ratio = Math.min(
			opts.maxWidth / width,
			opts.maxHeight / height,
		);
		width = Math.floor(width * ratio);
		height = Math.floor(height * ratio);
	} else if (opts?.maxWidth) {
		const ratio = opts.maxWidth / width;
		width = Math.floor(width * ratio);
		height = Math.floor(height * ratio);
	} else if (opts?.maxHeight) {
		const ratio = opts.maxHeight / height;
		width = Math.floor(width * ratio);
		height = Math.floor(height * ratio);
	}

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0, width, height);

	const data = ctx.getImageData(0, 0, width, height).data;

	return {
		data: image2sixel(data, width, height),
		height,
		width,
	};
}
