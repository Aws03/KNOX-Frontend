import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import type { MaterialItem } from "../types";

interface VideoPlayerDialogProps {
  material: MaterialItem | null;
  onClose: () => void;
}

/**
 * Streams a video material from storage/CDN. The signed URL supports range requests,
 * so the browser only downloads what is played and can seek freely.
 */
export function VideoPlayerDialog({ material, onClose }: VideoPlayerDialogProps) {
  return (
    <Dialog open={material !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{material?.title}</DialogTitle>
          {material?.description && (
            <DialogDescription>{material.description}</DialogDescription>
          )}
        </DialogHeader>
        {material && (
          <video
            key={material.id}
            className="aspect-video w-full rounded-lg bg-black"
            src={material.contentUrl}
            controls
            autoPlay
            preload="metadata"
            controlsList="nodownload"
          >
            <track kind="captions" />
          </video>
        )}
      </DialogContent>
    </Dialog>
  );
}
