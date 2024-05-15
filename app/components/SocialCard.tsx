import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, LinkIcon } from "lucide-react";
import type { FC, ReactNode } from "react";

import type { ValidCardRecord } from "~/api/types";
import { DevMkizkaTestProfileBoard } from "~/generated/api";

import { BlueskyIcon } from "./board/icons/BlueskyIcon";
import { Button } from "./shadcn/ui/button";
import { Card } from "./shadcn/ui/card";

// @dnd-kitのlistenersの型
// eslint-disable-next-line @typescript-eslint/ban-types
type Listeners = Record<string, Function>;

type SocialCardContentInnerProps = {
  Icon: FC;
  children: ReactNode;
  listeners?: Listeners;
};

function SocialCardContentInner({
  Icon,
  listeners,
  children,
}: SocialCardContentInnerProps) {
  return (
    <div className="flex h-8 items-center gap-2">
      <Icon />
      <p>{children}</p>
      <Button variant="ghost" size="icon" className="ml-auto" {...listeners}>
        <GripVertical className="fill-current text-muted-foreground" />
      </Button>
    </div>
  );
}

function SocialCardContent({ card, listeners }: SocialCardProps) {
  if (DevMkizkaTestProfileBoard.isBlueskyProfileCard(card)) {
    return (
      <SocialCardContentInner Icon={BlueskyIcon} listeners={listeners}>
        {card.handle}
      </SocialCardContentInner>
    );
  }
  return (
    <SocialCardContentInner Icon={LinkIcon} listeners={listeners}>
      <a href={card.url}>{card.url}</a>
    </SocialCardContentInner>
  );
}

type SocialCardProps = {
  card: ValidCardRecord;
  listeners?: Listeners;
  disabled?: boolean;
};

export function SocialCard({ card, disabled }: SocialCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: card.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      // > We highly recommend you specify the touch-action CSS property for all of your draggable elements.
      // https://docs.dndkit.com/api-documentation/draggable
      className="touch-none p-4"
      suppressHydrationWarning
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <SocialCardContent card={card} listeners={listeners} />
    </Card>
  );
}
