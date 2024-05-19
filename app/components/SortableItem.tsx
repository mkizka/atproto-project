import type { DraggableAttributes } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, LinkIcon } from "lucide-react";
import { type FC, forwardRef } from "react";

import type { CardScheme } from "~/api/validator";
import { cn } from "~/utils/cn";

import { BlueskyIcon } from "./board/icons/BlueskyIcon";
import { Button } from "./shadcn/ui/button";
import { Card } from "./shadcn/ui/card";

const isBlueskyProfileUrl = (hostname: string, paths: string[]) => {
  return (
    hostname === "bsky.app" && paths[1] === "profile" && paths[3] === undefined
  );
};

const parseCardUrl = (
  card: CardScheme,
): {
  icon: FC<React.SVGProps<SVGSVGElement>>;
  text: string;
  url: string;
} => {
  const url = new URL(card.url);
  const paths = url.pathname.split("/");
  if (isBlueskyProfileUrl(url.hostname, paths)) {
    return {
      icon: BlueskyIcon,
      text: paths[2],
      url: card.url,
    };
  }
  return {
    icon: LinkIcon,
    text: card.url,
    url: card.url,
  };
};

// @dnd-kitのlistenersの型
// eslint-disable-next-line @typescript-eslint/ban-types
type Listeners = Record<string, Function>;

type ItemProps = {
  card: CardScheme;
  disabled?: boolean;
  isOverlay?: boolean;
  isDragging?: boolean;
  style?: React.CSSProperties;
  attributes?: DraggableAttributes;
  listeners?: Listeners;
};

export const Item = forwardRef<HTMLDivElement, ItemProps>(
  (
    { card, disabled, isDragging, isOverlay, style, attributes, listeners },
    ref,
  ) => {
    const { icon: Icon, text, url } = parseCardUrl(card);
    return (
      <Card
        // > We highly recommend you specify the touch-action CSS property for all of your draggable elements.
        // https://docs.dndkit.com/api-documentation/sensors/pointer#touch-action
        className={cn(
          "flex w-full items-center h-16 touch-none hover:opacity-70",
          {
            "opacity-30": isDragging,
            // DragOverlayは拡大しておき100%スタートの拡大アニメーションをつける
            "animate-in zoom-in-100 scale-[103%] shadow-2xl": isOverlay,
            // DragOverlayで使用する場合はhoverを無効化
            "hover:opacity-100": isOverlay,
          },
        )}
        ref={ref}
        style={style}
        {...attributes}
      >
        <a className="flex min-w-0 flex-1 items-center gap-4 p-4" href={url}>
          <Icon className="size-8" />
          <p className="flex-1 truncate">{text}</p>
        </a>
        {!disabled && (
          <div className="p-4">
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto size-8"
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

type SocialCardProps = {
  card: CardScheme;
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
  } = useSortable({
    id: card.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Item
      card={card}
      ref={setNodeRef}
      disabled={disabled}
      isDragging={isDragging}
      style={style}
      attributes={attributes}
      listeners={listeners}
    />
  );
}
