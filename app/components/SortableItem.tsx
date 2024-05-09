import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Card } from "./Card";

type Props = {
  id: UniqueIdentifier;
};

export function SortableItem({ id }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      suppressHydrationWarning
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      123
    </Card>
  );
}
