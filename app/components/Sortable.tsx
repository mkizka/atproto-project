import type { DragEndEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { CardRecord } from "~/api/types";

import { SortableItem } from "./SortableItem";

type Props = {
  items: CardRecord[];
  setItems: React.Dispatch<React.SetStateAction<CardRecord[] | null>>;
};

export function Sortable({ items, setItems }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setItems((items) => {
        if (!items) return items;
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over!.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  const normalizedItems = items.filter((item) => !!item.id);
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        // @ts-expect-error
        items={normalizedItems}
        strategy={verticalListSortingStrategy}
      >
        {normalizedItems.map((item) => (
          // @ts-expect-error
          <SortableItem key={item.id} id={item.id} card={item} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
