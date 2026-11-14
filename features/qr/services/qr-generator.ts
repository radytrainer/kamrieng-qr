import "server-only";
import path from "node:path";
import { readFile } from "node:fs/promises";
import QRCode from "qrcode";
import sharp from "sharp";
import { buildStudentQrUrl } from "@/features/qr/utils/qr-payload";

export interface GenerateQrOptions {
  size?: number;
  margin?: number;
}

// "H" (~30% damage tolerance) is required, not just nice-to-have, once a
// logo covers the center — "M" would risk unscannable codes.
const QR_STYLE = {
  errorCorrectionLevel: "H" as const,
  color: { dark: "#0f172a", light: "#ffffff" },
};

// Logo + its white badge stay well inside the ~30% tolerance budget of a
// "H" QR code, with margin to spare for camera/lighting variance.
const BADGE_RATIO = 0.24;
const LOGO_RATIO = 0.78;

let logoPromise: Promise<Buffer> | null = null;

function loadLogo(): Promise<Buffer> {
  if (!logoPromise) {
    logoPromise = readFile(
      path.join(process.cwd(), "public", "logo", "logo.png")
    );
  }
  return logoPromise;
}

/** White circular badge with the school logo centered on it, sized relative
 * to the final QR pixel size — used as a single composited overlay so both
 * the PNG and SVG paths can share the exact same artwork. */
async function buildLogoOverlay(size: number): Promise<Buffer> {
  const badgeSize = Math.round(size * BADGE_RATIO);
  const logoSize = Math.round(badgeSize * LOGO_RATIO);

  const [logo] = await Promise.all([loadLogo()]);
  const logoResized = await sharp(logo)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  const badgeSvg = `<svg width="${badgeSize}" height="${badgeSize}"><circle cx="${badgeSize / 2}" cy="${badgeSize / 2}" r="${badgeSize / 2}" fill="white"/></svg>`;

  return sharp(Buffer.from(badgeSvg))
    .composite([{ input: logoResized, gravity: "center" }])
    .png()
    .toBuffer();
}

async function toQrPng(
  url: string,
  options: GenerateQrOptions = {}
): Promise<Buffer> {
  const size = options.size ?? 512;
  const [qr, overlay] = await Promise.all([
    QRCode.toBuffer(url, {
      type: "png",
      width: size,
      margin: options.margin ?? 1,
      ...QR_STYLE,
    }),
    buildLogoOverlay(size),
  ]);

  return sharp(qr)
    .composite([{ input: overlay, gravity: "center" }])
    .png()
    .toBuffer();
}

async function toQrSvg(
  url: string,
  options: GenerateQrOptions = {}
): Promise<string> {
  const size = options.size ?? 512;
  const [svg, overlay] = await Promise.all([
    QRCode.toString(url, {
      type: "svg",
      width: size,
      margin: options.margin ?? 1,
      ...QR_STYLE,
    }),
    buildLogoOverlay(size),
  ]);

  const badgeSize = Math.round(size * BADGE_RATIO);
  const offset = (size - badgeSize) / 2;
  const overlayDataUri = `data:image/png;base64,${overlay.toString("base64")}`;
  const image = `<image x="${offset}" y="${offset}" width="${badgeSize}" height="${badgeSize}" href="${overlayDataUri}" />`;

  return svg.replace("</svg>", `${image}</svg>`);
}

async function toQrDataUrl(
  url: string,
  options: GenerateQrOptions = {}
): Promise<string> {
  const png = await toQrPng(url, options);
  return `data:image/png;base64,${png.toString("base64")}`;
}

export function generateStudentQrPng(
  token: string,
  options?: GenerateQrOptions
): Promise<Buffer> {
  return toQrPng(buildStudentQrUrl(token), options);
}

export function generateStudentQrSvg(
  token: string,
  options?: GenerateQrOptions
): Promise<string> {
  return toQrSvg(buildStudentQrUrl(token), options);
}

export function generateStudentQrDataUrl(
  token: string,
  options?: GenerateQrOptions
): Promise<string> {
  return toQrDataUrl(buildStudentQrUrl(token), options);
}
