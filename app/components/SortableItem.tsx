import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { CardRecord } from "~/api/types";

import { Card } from "./shadcn/ui/card";

type Props = {
  id: string;
  card: CardRecord;
};

export function SortableItem({ id, card }: Props) {
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
      {JSON.stringify(card)}
    </Card>
  );
}
