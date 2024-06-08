import type {
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";

import { useBoard } from "./BoardProvider";
import { Item, SortableItem } from "./SortableItem";

type Props = {
  editable?: boolean;
};

export function Sortable({ editable }: Props) {
  const board = useBoard();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const activeCard = board.value.cards.find((card) => card.id === activeId);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const oldIndex = board.value.cards.findIndex(
        (item) => item.id === active.id,
      );
      const newIndex = board.value.cards.findIndex(
        (item) => item.id === over!.id,
      );
      const movedCards = arrayMove(board.value.cards, oldIndex, newIndex);
      board.setCards(movedCards);
    }
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={board.value.cards}
        strategy={verticalListSortingStrategy}
      >
        {board.value.cards.map((card) => (
          <SortableItem key={card.id} card={card} editable={editable} />
        ))}
      </SortableContext>
      <DragOverlay>
        {activeCard ? <Item card={activeCard} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
