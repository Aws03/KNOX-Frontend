import { useState } from "react";
import { Card } from "@/shared/ui/card";
import { MaterialCard } from "./MaterialCard";
import type { MaterialItem } from "../types";
import { VideoPlayerDialog } from "./VideoPlayerDialog";

interface MaterialsListProps {
  materials: MaterialItem[];
  isManagementMode: boolean;
  onEdit: (material: MaterialItem) => void;
  onDelete: (materialId: number) => void;
}

export function MaterialsList({
  materials,
  isManagementMode,
  onEdit,
  onDelete,
}: MaterialsListProps) {
  const [playing, setPlaying] = useState<MaterialItem | null>(null);

  if (materials.length === 0) return null;

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold">Materials</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {materials.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            isManagementMode={isManagementMode}
            onEdit={onEdit}
            onDelete={onDelete}
            onPlay={setPlaying}
          />
        ))}
      </div>
      <VideoPlayerDialog material={playing} onClose={() => setPlaying(null)} />
    </Card>
  );
}
