import { useState, useEffect, useCallback } from "react";
import {
  getCourseContents,
  getMyCourseContents,
  deleteFolder,
  deleteMaterial,
} from "../api";
import type { FolderContentsResponse } from "../types";
import { getApiErrorMessage } from "@/lib/api/errors";

interface UseFolderContentsProps {
  courseId: string | undefined;
  folderId: string | undefined;
  isManagementMode?: boolean;
}

interface UseFolderContentsReturn {
  contents: FolderContentsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  handleDeleteFolder: (folderId: number) => Promise<void>;
  handleDeleteMaterial: (materialId: number) => Promise<void>;
}

export function useFolderContents({
  courseId,
  folderId,
  isManagementMode = false,
}: UseFolderContentsProps): UseFolderContentsReturn {
  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState<FolderContentsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFolderContents = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);

    try {
      const data = isManagementMode
        ? await getMyCourseContents(courseId, folderId)
        : await getCourseContents(courseId, folderId);
      setContents(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load folder"));
      console.error("Error loading folder contents:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId, folderId, isManagementMode]);

  useEffect(() => {
    loadFolderContents();
  }, [loadFolderContents]);

  const handleDeleteFolder = async (folderIdToDelete: number) => {
    if (!confirm("Delete this folder? Its sub-folders are deleted too; files inside move to the course root.")) return;
    if (!courseId) return;

    try {
      await deleteFolder(folderIdToDelete);
      await loadFolderContents();
    } catch (err) {
      console.error("Error deleting folder:", err);
      alert(getApiErrorMessage(err, "Failed to delete folder"));
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    if (!courseId) return;

    try {
      await deleteMaterial(materialId);
      await loadFolderContents();
    } catch (err) {
      console.error("Error deleting material:", err);
      alert(getApiErrorMessage(err, "Failed to delete material"));
    }
  };



  return {
    contents,
    loading,
    error,
    refetch: loadFolderContents,
    handleDeleteFolder,
    handleDeleteMaterial,
  };
}
