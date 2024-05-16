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

import type { ValidCardRecord } from "~/api/types";

import { Item, SortableItem } from "./SortableItem";

type Props = {
  cards: ValidCardRecord[];
  setCards: React.Dispatch<React.SetStateAction<ValidCardRecord[]>>;
  sortable?: boolean;
};

export function Sortable({ cards, setCards, sortable }: Props) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const activeCard = cards.find((card) => card.id === activeId);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setCards((items) => {
        if (!items) return items;
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over!.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cards} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableItem key={card.id} card={card} disabled={!sortable} />
          ))}
        </SortableContext>
        <DragOverlay>
          {activeCard ? <Item card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
