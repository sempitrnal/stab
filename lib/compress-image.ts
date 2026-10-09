interface Options {
  /** Longest edge in px; larger images are scaled down, smaller are kept. */
  maxEdge: number;
  quality: number;
  type: "image/webp" | "image/jpeg";
}

const EXT = { "image/webp": "webp", "image/jpeg": "jpg" } as const;

/**
 * Downscales and re-encodes an image in the browser before upload. Falls back
 * to the original file if it can't be decoded (GIF/SVG/HEIC, old browsers) or
 * if re-encoding wouldn't make it smaller. Returns the file plus the extension
 * matching its actual type.
 */
export async function compressImage(
  file: File,
  { maxEdge, quality, type }: Options,
): Promise<{ file: File | Blob; ext: string }> {
  const original = {
    file,
    ext: file.name.includes(".") ? file.name.split(".").pop()! : "jpg",
  };
  if (!file.type.startsWith("image/") || /gif|svg/.test(file.type)) {
    return original;
  }

  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    // JPEG has no alpha; flatten transparency onto white instead of black.
    if (type === "image/jpeg") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, quality),
    );
    // Some browsers silently fall back to PNG when they can't encode `type`.
    if (!blob || blob.type !== type || blob.size >= file.size) return original;
    return { file: blob, ext: EXT[type] };
  } catch {
    return original;
  }
}
