import { cn } from "@/lib/utils";
import { useDragAndDrop, DraggedItem } from "@/hooks/useDragAndDrop";

interface VisitTileProps {
  visitType: string;
  name: string;
  hours: number;
  color: string;
  textColor: string;
  isStatic: boolean;
  onDragStart: (item: DraggedItem) => void;
  onDragEnd: () => void;
}

export function VisitTile({ 
  visitType, 
  name, 
  hours, 
  color, 
  textColor, 
  isStatic,
  onDragStart,
  onDragEnd
}: VisitTileProps) {
  const handleDragStart = (e: React.DragEvent) => {
    const item: DraggedItem = {
      visitType,
      hours,
      name,
      color,
      textColor,
      isStatic
    };
    onDragStart(item);
  };

  return (
    <div
      className="visit-tile drag-handle"
      style={{ backgroundColor: color, color: textColor }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      {name}
    </div>
  );
}
