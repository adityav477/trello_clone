import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import KanbanCard from "./KanbanCard";

export default function SortableKanbanCard({ card, boardId, refreshBoard, list }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: card.id, data: { ...card } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Fade out the original card while dragging
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      {/* The actual aesthetic card */}
      <KanbanCard list={list} card={card} boardId={boardId} refreshBoard={refreshBoard} />
    </div>
  );
}
