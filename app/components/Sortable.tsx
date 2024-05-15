import type { DragEndEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
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

import type { ValidCardRecord } from "~/api/types";

import { SocialCard } from "./SocialCard";

type Props = {
  cards: ValidCardRecord[];
  setCards: React.Dispatch<React.SetStateAction<ValidCardRecord[]>>;
  sortable?: boolean;
};

export function Sortable({ cards, setCards, sortable }: Props) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setCards((items) => {
        if (!items) return items;
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over!.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={cards} strategy={verticalListSortingStrategy}>
        {cards.map((card) => (
          <SocialCard key={card.id} card={card} disabled={!sortable} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
