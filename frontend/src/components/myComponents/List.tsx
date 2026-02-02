import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import SortableKanbanCard from "./SortableKanbanCard";
import KanbanCardCreator from "./KanbanCardCreator";

function List(props: any) {
  const { id, items, refreshBoard, title, setBoard, list, board } = props;
  const { setNodeRef } = useDroppable({
    id
  });
  return (
    <SortableContext id={id} strategy={verticalListSortingStrategy} items={items}>

      <div key={list.id} className="w-72 shrink-0 flex flex-col max-h-[calc(100vh-8rem)] bg-[#f1f2f4] rounded-xl shadow-sm border border-white/20">

        <div className="p-3 font-semibold text-[#172b4d] text-sm">{list.title}</div>
        <div className="flex-1 overflow-y-auto px-2 space-y-2 pb-2 min-h-[50px]" ref={setNodeRef}>
          {items.map((card: any) => {
            return (
              <SortableKanbanCard list={title} boardId={board?.id} key={card.id} card={card} refreshBoard={refreshBoard} />
            )
          })}
        </ div >

        <div className="p-2">
          <KanbanCardCreator listId={list.id} onCardAdded={(newCard) => {
            const newLists = board.lists.map((l: any) => l.id === list.id ? { ...l, cards: [...l.cards, newCard] } : l);
            setBoard({ ...board, lists: newLists });
          }}
            listLength={list.cards.length}
          />
        </div>

      </div>
    </SortableContext >
  )
}

export default List
