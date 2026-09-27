/**
 * Extract file extension from URL
 */
export function getFileExtension(url: string): string {
  const match = url.match(/\.([^./?#]+)(?:[?#]|$)/);
  return match ? match[1].toLowerCase() : "";
}

/**
 * Open file in a new browser tab
 */
export function openFile(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Download file to user's device
 */
export function downloadFile(url: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Human-readable file size, e.g. 1.5 MB
 */
export function formatFileSize(bytes: number): string {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function isVideo(contentType: string | undefined): boolean {
  return !!contentType && contentType.startsWith("video/");
}
