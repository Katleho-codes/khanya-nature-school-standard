import fs from "node:fs";
import path from "node:path";
import { PhotoFrame, type PhotoFrameProps } from "./PhotoFrame";

function imageExists(src: string | null): boolean {
  if (!src) return false;
  if (src.startsWith("/uploads/")) return true;
  if (!src.startsWith("/images/")) return false;
  return fs.existsSync(path.join(process.cwd(), "public", src));
}

export function Photo(props: PhotoFrameProps) {
  return <PhotoFrame {...props} hasImage={imageExists(props.src)} />;
}

export { imageExists };
