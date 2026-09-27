import { Button } from "@/shared/ui/button";
import { File as FileIcon, Edit, PlayCircle, Trash2 } from "lucide-react";
import ShareButton from "@/shared/ui/ShareButton";
import type { MaterialItem } from "../types";
import { getFileExtension, openFile, downloadFile, formatFileSize, isVideo } from "../utils";

interface MaterialCardProps {
  material: MaterialItem;
  isManagementMode: boolean;
  onEdit: (material: MaterialItem) => void;
  onDelete: (materialId: number) => void;
  onPlay: (material: MaterialItem) => void;
}

export function MaterialCard({
  material,
  isManagementMode,
  onEdit,
  onDelete,
  onPlay,
}: MaterialCardProps) {
  const ext = getFileExtension(material.contentUrl);
  const video = isVideo(material.contentType);
  // Videos play in the page; everything else opens the (short-lived) signed file URL.
  const open = () => (video ? onPlay(material) : openFile(material.contentUrl));
  const Icon = video ? PlayCircle : FileIcon;

  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 transition hover:border-primary/60 hover:bg-background">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium text-foreground group-hover:text-primary">
          {material.title}
        </p>
        {material.description && (
          <p className="truncate text-xs text-muted-foreground">
            {material.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          .{ext}
          {material.sizeBytes > 0 && ` · ${formatFileSize(material.sizeBytes)}`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {!isManagementMode && (
          <>
            {/* Share the page, never the file URL: it is signed for the viewer and expires. */}
            <ShareButton
              url={window.location.href}
              title={`Check out this material: ${material.title}`}
              variant="ghost"
              size="icon"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={open}
            >
              Open
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => downloadFile(material.contentUrl, material.title)}
            >
              Download
            </Button>
          </>
        )}

        {isManagementMode && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={open}
            >
              Open
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(material);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(material.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
