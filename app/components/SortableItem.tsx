import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Card } from "./shadcn/ui/card";

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
      className="p-4"
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
