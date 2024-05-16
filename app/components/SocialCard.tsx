import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, LinkIcon } from "lucide-react";
import type { FC } from "react";

import type { ValidCardRecord } from "~/api/types";
import { DevMkizkaTestProfileBoard } from "~/generated/api";

import { BlueskyIcon } from "./board/icons/BlueskyIcon";
import { Button } from "./shadcn/ui/button";
import { Card } from "./shadcn/ui/card";

// @dnd-kitのlistenersの型
// eslint-disable-next-line @typescript-eslint/ban-types
type Listeners = Record<string, Function>;

type SocialCardContentInnerProps = {
  icon: FC<React.SVGProps<SVGSVGElement>>;
  text: string;
  url: string;
  disabled?: boolean;
  listeners?: Listeners;
};

function SocialCardContentInner({
  icon: Icon,
  text,
  url,
  disabled,
  listeners,
}: SocialCardContentInnerProps) {
  return (
    <div className="flex h-16">
      <a
        className="flex size-full items-center gap-4 p-4 hover:underline"
        href={url}
      >
        <Icon className="size-8" />
        <p>{text}</p>
      </a>
      {!disabled && (
        <div className="flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            {...listeners}
          >
            <GripVertical className="fill-current text-muted-foreground" />
          </Button>
        </div>
      )}
    </div>
  );
}

type SocialCardContentProps = {
  card: ValidCardRecord;
  disabled?: boolean;
  listeners?: Listeners;
};

function SocialCardContent({ card, ...innerProps }: SocialCardContentProps) {
  if (DevMkizkaTestProfileBoard.isBlueskyProfileCard(card)) {
    return (
      <SocialCardContentInner
        icon={BlueskyIcon}
        text={`@${card.handle}`}
        url={`https://bsky.app/profile/${card.handle}`}
        {...innerProps}
      />
    );
  }
  return (
    <SocialCardContentInner
      icon={LinkIcon}
      text={card.url}
      url={card.url}
      {...innerProps}
    />
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
      className="touch-none"
      suppressHydrationWarning
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <SocialCardContent
        card={card}
        disabled={disabled}
        listeners={listeners}
      />
    </Card>
  );
}
