import { useState, useEffect, useCallback } from "react";
import { getCourseContents, getMyCourseContents } from "../api";
import type { FolderContentsResponse } from "../types";
import { getApiErrorMessage } from "@/lib/api/errors";

interface UseCourseMaterialsProps {
  courseId: string | undefined;
  isManagementMode?: boolean;
}

export function useCourseMaterials(
  courseIdOrProps: string | undefined | UseCourseMaterialsProps
) {
  // Support both old (string) and new (object) API
  const courseId =
    typeof courseIdOrProps === "string" || courseIdOrProps === undefined
      ? courseIdOrProps
      : courseIdOrProps.courseId;
  const isManagementMode =
    typeof courseIdOrProps === "object" && courseIdOrProps !== undefined
      ? courseIdOrProps.isManagementMode
      : false;

  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState<FolderContentsResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const loadRootMaterials = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);

    try {
      const data = isManagementMode
        ? await getMyCourseContents(courseId)
        : await getCourseContents(courseId);
      setContents(data);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Failed to load materials")
      );
      console.error("Error loading materials:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId, isManagementMode]);

  useEffect(() => {
    loadRootMaterials();
  }, [loadRootMaterials]);

  return { loading, contents, error, refetch: loadRootMaterials };
}
