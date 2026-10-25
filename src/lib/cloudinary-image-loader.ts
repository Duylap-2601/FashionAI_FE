/**
 * Next.js custom image loader for Cloudinary URLs.
 *
 * When `src` is a Cloudinary URL (res.cloudinary.com) this loader injects a
 * width + quality transformation directly into the URL so the browser fetches
 * the already-optimised image from Cloudinary's CDN.  This completely avoids
 * the /_next/image proxy, which would otherwise have to fetch the full-size
 * image from Cloudinary and then re-encode it — causing 500 timeouts on
 * large product images.
 *
 * For every other URL the loader falls back to Next.js built-in behaviour by
 * returning `/_next/image?url=...` as normal.
 */

interface LoaderParams {
  src: string;
  width: number;
  quality?: number;
}

const CLOUDINARY_RE = /^https?:\/\/(?:res|[^/]+)\.cloudinary\.com\//;

export default function cloudinaryLoader({ src, width, quality }: LoaderParams): string {
  // Non-Cloudinary URL — fall back to the standard Next.js image optimizer
  if (!CLOUDINARY_RE.test(src)) {
    const params = new URLSearchParams({ url: src, w: String(width), q: String(quality ?? 75) });
    return `/_next/image?${params.toString()}`;
  }

  // Cloudinary URL: inject w_ and q_ transformation.
  // Cloudinary fetch-URL structure:
  //   https://res.cloudinary.com/<cloud>/image/upload/<transformations>/<public_id>
  //
  // We insert `w_<width>,q_<quality>,f_auto` after "/upload/" (or after the
  // last known delivery type segment).  If transformations are already present
  // we prepend ours so they win.
  const uploadSegment = '/upload/';
  const idx = src.indexOf(uploadSegment);
  if (idx === -1) {
    // Unexpected Cloudinary URL shape — return as-is; better than a broken URL
    return src;
  }

  const base = src.slice(0, idx + uploadSegment.length);
  const rest = src.slice(idx + uploadSegment.length);

  const transform = `w_${width},q_${quality ?? 75},f_auto/`;

  // Avoid double-injecting if the URL already carries our transforms
  if (rest.startsWith(transform)) return src;

  return `${base}${transform}${rest}`;
}
