import type { DraggableAttributes } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, LinkIcon } from "lucide-react";
import { type FC, forwardRef } from "react";

import type { ValidCardRecord } from "~/api/types";
import { DevMkizkaTestProfileBoard } from "~/generated/api";
import { cn } from "~/utils/cn";

import { BlueskyIcon } from "./board/icons/BlueskyIcon";
import { Button } from "./shadcn/ui/button";
import { Card } from "./shadcn/ui/card";

// @dnd-kitのlistenersの型
// eslint-disable-next-line @typescript-eslint/ban-types
type Listeners = Record<string, Function>;

type ItemTemplateProps = {
  icon: FC<React.SVGProps<SVGSVGElement>>;
  text: string;
  url: string;
  disabled?: boolean;
  isDragging?: boolean;
  style?: React.CSSProperties;
  attributes?: DraggableAttributes;
  listeners?: Listeners;
};

const ItemTemplate = forwardRef<HTMLDivElement, ItemTemplateProps>(
  (
    {
      icon: Icon,
      text,
      url,
      disabled,
      isDragging,
      style,
      attributes,
      listeners,
    },
    ref,
  ) => {
    return (
      <Card
        className={cn("flex h-16", {
          "opacity-30": isDragging,
        })}
        ref={ref}
        style={style}
        {...attributes}
      >
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
      </Card>
    );
  },
);

type SortableItemProps = {
  card: ValidCardRecord;
  cardRef?: React.Ref<HTMLDivElement>;
} & Omit<ItemTemplateProps, "icon" | "text" | "url">;

export function Item({ card, cardRef, ...rest }: SortableItemProps) {
  const templateProps = {
    ref: cardRef,
    ...rest,
  };
  if (DevMkizkaTestProfileBoard.isBlueskyProfileCard(card)) {
    return (
      <ItemTemplate
        icon={BlueskyIcon}
        text={`@${card.handle}`}
        url={`https://bsky.app/profile/${card.handle}`}
        {...templateProps}
      />
    );
  }
  return (
    <ItemTemplate
      icon={LinkIcon}
      text={card.url}
      url={card.url}
      {...templateProps}
    />
  );
}

type SocialCardProps = {
  card: ValidCardRecord;
  listeners?: Listeners;
  disabled?: boolean;
};

export function SortableItem({ card, disabled }: SocialCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Item
      card={card}
      cardRef={setNodeRef}
      disabled={disabled}
      isDragging={isDragging}
      style={style}
      attributes={attributes}
      listeners={listeners}
    />
  );
}
