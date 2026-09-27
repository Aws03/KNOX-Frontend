import { describe, expect, it } from "vitest";

import { formatFileSize, getFileExtension, isVideo } from "./utils";

describe("material utils", () => {
  it("reads the extension of signed URLs, ignoring the query string", () => {
    expect(getFileExtension("https://cdn.example.com/materials/3/abc.MP4?token=x&expires=1")).toBe("mp4");
    expect(getFileExtension("https://files.example.com/knox-private/a.pdf?X-Amz-Signature=y")).toBe("pdf");
  });

  it("formats sizes for people", () => {
    expect(formatFileSize(0)).toBe("");
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(3 * 1024 * 1024 * 1024)).toBe("3.0 GB");
  });

  it("recognises videos by content type", () => {
    expect(isVideo("video/mp4")).toBe(true);
    expect(isVideo("application/pdf")).toBe(false);
    expect(isVideo(undefined)).toBe(false);
  });
});
