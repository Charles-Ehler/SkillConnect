import { useState, useCallback } from 'react';

export interface DraggedItem {
  visitType: string;
  hours: number;
  name: string;
  color: string;
  textColor: string;
  isStatic: boolean;
}

export function useDragAndDrop() {
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  const handleDragStart = useCallback((item: DraggedItem) => {
    setDraggedItem(item);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverTarget(null);
  }, []);

  const handleDragOver = useCallback((targetId: string) => {
    setDragOverTarget(targetId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverTarget(null);
  }, []);

  return {
    draggedItem,
    dragOverTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave
  };
}
