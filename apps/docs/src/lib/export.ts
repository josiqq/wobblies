// Browser-only helpers: rasterise SVG avatars to PNG and download files.
import { type AvatarOptions, createAvatar, toDataUri } from "@wobblies/core";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not rasterize the avatar"));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode the PNG"))),
      "image/png",
    ),
  );
}

function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available");
  return ctx;
}

/** Turns a name into a safe file name stem (accents stripped, `avatar` if empty). */
export function slug(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "avatar"
  );
}

/** Renders one avatar to a `px` x `px` PNG. */
export async function avatarToPng(
  name: string,
  px: number,
  options: AvatarOptions = {},
): Promise<Blob> {
  const { svg } = createAvatar(name, { ...options, size: px, animated: false });
  const img = await loadImage(toDataUri(svg));
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = px;
  context2d(canvas).drawImage(img, 0, 0, px, px);
  return canvasToBlob(canvas);
}

/** Layout of an avatar sheet. `background` is any SVG fill; omit it for transparency. */
export interface GridOptions {
  names: string[];
  cols: number;
  cell: number;
  gap: number;
  background?: string;
}

function gridSize({ names, cols, cell, gap }: GridOptions) {
  const rows = Math.max(1, Math.ceil(names.length / cols));
  return { width: cols * cell + gap * (cols + 1), height: rows * cell + gap * (rows + 1) };
}

/** Lays the avatars out on a single SVG sheet. */
export function gridToSvg(grid: GridOptions, options: AvatarOptions = {}): string {
  const { width, height } = gridSize(grid);
  const bg = grid.background ? `<rect width="100%" height="100%" fill="${grid.background}"/>` : "";
  const cells = grid.names
    .map((name, i) => {
      const x = grid.gap + (i % grid.cols) * (grid.cell + grid.gap);
      const y = grid.gap + Math.floor(i / grid.cols) * (grid.cell + grid.gap);
      return createAvatar(name, { ...options, animated: false }).svg.replace(
        "<svg ",
        `<svg x="${x}" y="${y}" width="${grid.cell}" height="${grid.cell}" `,
      );
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${bg}${cells}</svg>`;
}

/** Rasterises the avatar sheet to a PNG. */
export async function gridToPng(grid: GridOptions, options: AvatarOptions = {}): Promise<Blob> {
  const { width, height } = gridSize(grid);
  const img = await loadImage(toDataUri(gridToSvg(grid, options)));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  context2d(canvas).drawImage(img, 0, 0);
  return canvasToBlob(canvas);
}

/** Saves a Blob (or an SVG string) as a file download. */
export function download(data: Blob | string, filename: string): void {
  const blob = typeof data === "string" ? new Blob([data], { type: "image/svg+xml" }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
