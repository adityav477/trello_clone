import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { ScrollArea } from "@/components/ui/scroll-area";

// Components
import KanbanCard from "@/components/myComponents/KanbanCard"; // Needed for the Ghost Overlay
import List from "../myComponents/List";
import AddList from "../myComponents/AddList";

export default function BoardView() {
  const { id } = useParams();
  const axiosPrivate = useAxiosPrivate();

  // State
  const [board, setBoard] = useState<any>(null);
  const [, setActiveId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<any>(null); // Visual data for dragging ghost
  const [startListId, setStartListId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const { data } = await axiosPrivate.get(`/api/boards/${id}`);
        const boardData = data?.board || data;

        //sort the cards based on order or the database just fetches however it feels free
        boardData.lists = boardData.lists.map((list: any) => ({
          ...list,
          cards: list.cards.sort((a: any, b: any) => a.order - b.order)
        }));

        setBoard(boardData);
      } catch (err) { console.error(err); }
    };
    fetchBoard();
  }, [id]);

  const findListByCardId = (cardId: string) => {
    return board?.lists.find((list: any) => list.cards.some((c: any) => c.id === cardId));
  };

  const findListById = (listId: string) => {
    return board?.lists.find((list: any) => list.id === listId);
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    console.log("active:", active);
    const id = active.id as string;
    setActiveId(id);

    // Find the card data to render the Ghost Overlay
    const list = findListByCardId(id);
    const card = list?.cards.find((c: any) => c.id === id);
    setActiveCard(card);
    setStartListId(list?.id);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    console.log("activeId:", activeId, "overId:", overId);

    // Find the containers
    const activeList = findListByCardId(activeId);
    const overList = findListByCardId(overId) || findListById(overId);
    console.log("activeList:", activeList, "overList:", overList);

    //overDragEnd handles the same list reordering
    if (!activeList || !overList || activeList.id === overList.id) return;

    setBoard((prev: any) => {
      const activeItems = activeList.cards;
      const overItems = overList.cards;
      const activeIndex = activeItems.findIndex((c: any) => c.id === activeId);
      const overIndex = overItems.findIndex((c: any) => c.id === overId);

      let newIndex;

      const isOverContainer = prev.lists.some((l: any) => l.id === overId);

      if (isOverContainer) {
        newIndex = overItems.length + 1; // Move to end
      } else {
        const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        lists: prev.lists.map((l: any) => {
          if (l.id === activeList.id) {
            return { ...l, cards: activeItems.filter((c: any) => c.id !== activeId) };
          }
          if (l.id === overList.id) {
            return {
              ...l,
              cards: [
                ...overItems.slice(0, newIndex),
                activeItems[activeIndex],
                ...overItems.slice(newIndex, overItems.length)
              ]
            };
          }
          return l;
        })
      };
    });
  };

  const onDragEnd = async (event: DragEndEvent) => {
    console.log("onDragEnd Started");
    const { active, over } = event;
    const activeCardId = active.id as string;
    const overCardId = over?.id as string;
    console.log("activeCardId:", activeCardId, "overCardId:", overCardId);

    const overList = findListByCardId(overCardId) || findListById(overCardId);
    console.log("overrList:", overList);

    if (!overList || !startListId) {
      setActiveId(null);
      setActiveCard(null);
      setStartListId(null);
      return;
    }

    //get index of active card and over card if exista
    const activeIndex = overList.cards.findIndex((c: any) => c.id === activeCardId);
    let overIndex = overList.cards.findIndex((c: any) => c.id === overCardId);
    console.log("activeIndex:", activeIndex, "overIndex:", overIndex);

    if (overIndex === -1) {
      overIndex = 0;
    }

    let finalCards = overList.cards;

    //only works for same list reordderring
    if (startListId === overList.id) {
      if (activeIndex !== overIndex) {
        //reorder the cards in same list
        finalCards = arrayMove(overList.cards, activeIndex, overIndex);

        setBoard((prev: any) => ({
          ...prev,
          lists: prev.lists.map((l: any) =>
            l.id === overList.id ? { ...l, cards: finalCards } : l
          )
        }));
      }
    }
    //the on drag already checked the cross list ordering
    else {
      finalCards = overList.cards;
    }

    //only work if either the card changed list or card changed order
    if (startListId !== overList.id || activeIndex !== overIndex) {
      try {
        const cardIds = finalCards.map((c: any) => c.id);
        console.log("order update triggered", finalCards);

        const response = await axiosPrivate.put("/api/cards/reorder", {
          boardId: id,
          sourceListId: startListId,
          destinationListId: overList.id,
          draggedCardId: activeCardId,
          destinationCardIds: cardIds
        });
        console.log("response after reoder update:", response);
      } catch (err) {
        console.error("Failed to save order", err);
      }
    }

    setActiveId(null);
    setActiveCard(null);
    setStartListId(null);
  };
  if (!board) return <div className="flex h-screen items-center justify-center text-slate-500">Loading board...</div>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="h-screen flex flex-col bg-[#0079bf]">
        {/* Header */}
        <div className="h-14 flex items-center px-6 bg-black/10 backdrop-blur-sm text-white shrink-0">
          <h2 className="text-xl font-bold tracking-tight">{board.title}</h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex p-6 gap-6 h-full items-start">

            {board.lists?.map((list: any) => (

              <List
                id={list.id}
                key={list.id}
                title={list.title}
                items={list.cards}
                refreshBoard={() => { window.location.reload() }}
                list={list}
                setBoard={setBoard}
                board={board}
              />
            ))}

            <div className="w-72 shrink-0">
              {id && (
                <AddList
                  boardId={id}
                  onListAdded={(newList) => {
                    setBoard({ ...board, lists: [...board.lists, newList] });
                  }}
                />
              )}
            </div>

          </div>
        </ScrollArea>

        {/* The Ghost Overlay: What you see following your mouse */}
        <DragOverlay>
          {activeCard ? (
            <div className="rotate-2 cursor-grabbing opacity-90 scale-105">
              <KanbanCard list="Todo" card={activeCard} boardId={id} refreshBoard={() => { }} />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
