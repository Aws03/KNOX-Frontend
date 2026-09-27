export type FolderItem = {
  id: number;
  name: string;
  courseId: number;
  description?: string | null;
};

export type MaterialItem = {
  id: number;
  title: string;
  /** Short-lived signed URL; refetch the listing to get a fresh one. */
  contentUrl: string;
  contentType: string;
  sizeBytes: number;
  courseId: number;
  description?: string | null;
};

export type FolderContentsResponse = {
  courseId: number;
  folders: FolderItem[];
  materials: MaterialItem[];
};
