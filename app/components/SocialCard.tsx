import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LinkIcon } from "lucide-react";
import type { FC, ReactNode } from "react";

import type { ValidCardRecord } from "~/api/types";
import { DevMkizkaTestProfileBoard } from "~/generated/api";

import { BlueskyIcon } from "./board/icons/BlueskyIcon";
import { Card } from "./shadcn/ui/card";

type SocialCardContentInnerProps = {
  Icon: FC;
  children: ReactNode;
};

function SocialCardContentInner({
  Icon,
  children,
}: SocialCardContentInnerProps) {
  return (
    <div className="flex h-8 items-center gap-2">
      <Icon />
      <p>{children}</p>
    </div>
  );
}

function SocialCardContent({ card }: SocialCardProps) {
  if (DevMkizkaTestProfileBoard.isBlueskyProfileCard(card)) {
    return (
      <SocialCardContentInner Icon={BlueskyIcon}>
        {card.handle}
      </SocialCardContentInner>
    );
  }
  return (
    <SocialCardContentInner Icon={LinkIcon}>
      <a href={card.url}>{card.url}</a>
    </SocialCardContentInner>
  );
}

type SocialCardProps = {
  card: ValidCardRecord;
};

export function SocialCard({ card }: SocialCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: card.id });

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
      {...listeners}
    >
      <SocialCardContent card={card} />
    </Card>
  );
}
