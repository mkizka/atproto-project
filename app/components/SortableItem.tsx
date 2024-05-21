import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LinkIcon, X } from "lucide-react";
import type { ReactNode } from "react";
import { type FC, forwardRef, useState } from "react";

import type { CardScheme } from "~/api/validator";
import { cn } from "~/utils/cn";

import { BlueskyIcon } from "./board/icons/BlueskyIcon";
import { Button } from "./shadcn/ui/button";
import type { CardProps } from "./shadcn/ui/card";
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

type ItemInnerProps = {
  card: CardScheme;
};

function ItemInner({ card }: ItemInnerProps) {
  const parsed = parseCardUrl(card);
  if (parsed) {
    return (
      <a
        className="flex min-w-0 flex-1 items-center gap-4 p-4 hover:opacity-70"
        href={parsed.url}
      >
        <parsed.icon className="size-8" />
        <p className="flex-1 truncate">{parsed.text}</p>
      </a>
    );
  }
  // TODO: 投稿を埋め込むパターンに対応する
  throw new Error("Not Implemented");
}

// @dnd-kitのlistenersの型
// eslint-disable-next-line @typescript-eslint/ban-types
type Listeners = Record<string, Function>;

type ItemProps = {
  card: CardScheme;
  children?: ReactNode;
  removeCard?: (id: string) => void;
  disabled?: boolean;
  isOverlay?: boolean;
  isDragging?: boolean;
} & CardProps<"div">;

export const Item = forwardRef<HTMLDivElement, ItemProps>(
  (
    { card, removeCard, disabled, isDragging, isOverlay, ref: _, ...cardProps },
    ref,
  ) => {
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemove = () => {
      const ok = confirm(`${card.url} を削除しますか？`);
      if (!ok) return;
      setIsRemoving(true);
      setTimeout(() => {
        removeCard?.(card.id);
      }, 200);
    };

    return (
      <Card
        // > We highly recommend you specify the touch-action CSS property for all of your draggable elements.
        // https://docs.dndkit.com/api-documentation/sensors/pointer#touch-action
        className={cn("flex w-full items-center h-16 touch-none", {
          "opacity-30": isDragging,
          // DragOverlayは拡大しておき100%スタートの拡大アニメーションをつける
          "animate-in zoom-in-100 scale-[103%] shadow-2xl": isOverlay,
          "animate-out zoom-out-90 fade-out duration-300": isRemoving,
        })}
        ref={ref}
        {...cardProps}
      >
        <ItemInner card={card} />
        {!disabled && (
          <div className="flex gap-2 p-4">
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto size-8"
              onClick={handleRemove}
            >
              <X className="fill-current text-destructive" />
            </Button>
          </div>
        )}
      </Card>
    );
  },
);

type SocialCardProps = {
  card: CardScheme;
  removeCard: (id: string) => void;
  listeners?: Listeners;
  disabled?: boolean;
};

export function SortableItem({ card, removeCard, disabled }: SocialCardProps) {
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
      removeCard={removeCard}
      ref={setNodeRef}
      disabled={disabled}
      isDragging={isDragging}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
}
