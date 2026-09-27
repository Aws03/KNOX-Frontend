import axios from "axios";
import { apiClient } from "@/lib/api/apiClient";
import type {
  FolderContentsResponse,
  CourseMaterialsResponse,
  FolderItem,
  MaterialItem,
} from "./types";

/**
 * Fetch course contents (folders and materials) at root level or within a specific folder
 */
export async function getCourseContents(
  courseId: string,
  folderId?: string
): Promise<FolderContentsResponse> {
  const url = `/courses/${courseId}/contents${
    folderId ? `?folderId=${folderId}` : ""
  }`;
  const response = await apiClient.get<FolderContentsResponse>(url);
  return response.data;
}

//get the course content that the user writed it
export async function GetMyCourseContent(
  courseId: string,
  folderId?: string
): Promise<FolderContentsResponse> {
  const url = `/courses/${courseId}/my-contents${
    folderId ? `?folderId=${folderId}` : ""
  }`;
  const response = await apiClient.get<FolderContentsResponse>(url);
  return response.data;
}

/**
 * Fetch root level course materials (no folder)
 */
export async function getCourseMaterials(
  courseId: string
): Promise<CourseMaterialsResponse> {
  const response = await apiClient.get<CourseMaterialsResponse>(
    `/courses/${courseId}/contents`
  );
  return response.data;
}

/**
 * Delete a folder by ID
 */
export async function deleteFolder(folderId: number): Promise<void> {
  await apiClient.delete(`/folders/${folderId}`);
}

/**
 * Delete a material by ID
 */
export async function deleteMaterial(materialId: number): Promise<void> {
  await apiClient.delete(`/materials/${materialId}`);
}

/**
 * Create a new folder within a course, optionally nested under a parent folder
 */
export async function createFolder(
  courseId: string,
  data: { name: string; parentFolderId?: number; description?: string }
): Promise<FolderItem> {
  const response = await apiClient.post<FolderItem>(`/courses/${courseId}/folders`, {
    name: data.name,
    parentFolderId: data.parentFolderId ?? null,
    description: data.description || null,
  });
  return response.data;
}

type MaterialUploadTicket = {
  key: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  expiresAt: string;
};

/**
 * Upload a material file straight to object storage and return its upload key.
 * The API only signs the upload; the bytes (large videos included) never pass through it.
 */
export async function uploadMaterialFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const { data: ticket } = await apiClient.post<MaterialUploadTicket>(
    "/files/material-uploads",
    { fileName: file.name, size: file.size }
  );

  // Plain axios: the signed URL is the only credential storage needs (no API token, no base URL).
  await axios.request({
    method: ticket.method,
    url: ticket.url,
    data: file,
    headers: ticket.headers,
    onUploadProgress: (event) => {
      if (event.total) onProgress?.(Math.round((event.loaded * 100) / event.total));
    },
  });

  return ticket.key;
}

/**
 * Create a course material record pointing at an already-uploaded file
 */
export async function createMaterial(
  courseId: string,
  data: {
    title: string;
    uploadKey: string;
    folderId?: number;
    description?: string;
  }
): Promise<MaterialItem> {
  const response = await apiClient.post<MaterialItem>(`/courses/${courseId}/materials`, {
    title: data.title,
    uploadKey: data.uploadKey,
    folderId: data.folderId ?? null,
    description: data.description || null,
  });
  return response.data;
}
