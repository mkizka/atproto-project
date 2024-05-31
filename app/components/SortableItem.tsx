import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LinkIcon, LoaderCircle, PencilLine, X } from "lucide-react";
import type { ReactNode } from "react";
import { type FC, forwardRef, useState } from "react";

import type { CardScheme } from "~/api/validator";
import { cn } from "~/utils/cn";
import { atUri, isBlueskyPostUrl, isBlueskyProfileUrl } from "~/utils/urls";

import { BlueskyEmbed } from "./BlueskyEmbed";
import { BlueskyIcon } from "./board/icons/BlueskyIcon";
import { Button } from "./shadcn/ui/button";
import type { CardProps } from "./shadcn/ui/card";
import { Card } from "./shadcn/ui/card";

type ParsedCard =
  | {
      type: "link";
      icon: FC<React.SVGProps<SVGSVGElement>>;
      text: string;
      url: string;
    }
  | {
      type: "embed";
      blueskyUri: string;
    };

const parseCard = (card: CardScheme): ParsedCard => {
  const url = new URL(card.url);
  if (isBlueskyPostUrl(url)) {
    return {
      type: "embed",
      blueskyUri: atUri(url),
    };
  }
  if (isBlueskyProfileUrl(url)) {
    return {
      type: "link",
      icon: BlueskyIcon,
      text: `@${url.pathname.split("/")[2]}`,
      url: card.url,
    };
  }
  if (url.hostname === "bsky.app") {
    return {
      type: "link",
      icon: BlueskyIcon,
      text: card.url,
      url: card.url,
    };
  }
  return {
    type: "link",
    icon: LinkIcon,
    text: card.url,
    url: card.url,
  };
};

type ItemInnerProps = {
  card: CardScheme;
};

function ItemInner({ card }: ItemInnerProps) {
  const parsed = parseCard(card);

  if (parsed.type === "embed") {
    return (
      <div className="relative size-full">
        {/* クリック領域に被せて並び替え可能にする */}
        <div className="absolute size-full" />
        <BlueskyEmbed blueskyUri={parsed.blueskyUri} />
        <LoaderCircle className="absolute inset-0 -z-10 m-auto size-8 animate-spin stroke-current text-muted-foreground" />
      </div>
    );
  }
  return (
    <Card
      as="a"
      className="flex h-16 min-w-0 flex-1 items-center gap-4 p-4 hover:opacity-70"
      href={parsed.url}
    >
      <parsed.icon className="size-8" />
      <p className="flex-1 truncate">{parsed.text}</p>
    </Card>
  );
}

type ItemProps = {
  card: CardScheme;
  children?: ReactNode;
  editCard?: (id: string) => void;
  removeCard?: (id: string) => void;
  editable?: boolean;
  isOverlay?: boolean;
  isDragging?: boolean;
} & CardProps;

export const Item = forwardRef<HTMLDivElement, ItemProps>(
  (
    {
      card,
      editCard,
      removeCard,
      editable,
      isDragging,
      isOverlay,
      ...cardProps
    },
    ref,
  ) => {
    const [isRemoving, setIsRemoving] = useState(false);

    const handleEdit = () => {
      editCard?.(card.id);
    };

    const handleRemove = () => {
      const ok = confirm(`${card.url} を削除しますか？`);
      if (!ok) return;
      setIsRemoving(true);
      setTimeout(() => {
        removeCard?.(card.id);
      }, 200);
    };

    return (
      <article className="relative">
        <div
          // > We highly recommend you specify the touch-action CSS property for all of your draggable elements.
          // https://docs.dndkit.com/api-documentation/sensors/pointer#touch-action
          className={cn("flex w-full items-center touch-none", {
            "opacity-30": isDragging,
            // DragOverlayは拡大しておき100%スタートの拡大アニメーションをつける
            "animate-in zoom-in-100 scale-[103%] shadow-2xl": isOverlay,
            "animate-out zoom-out-90 fade-out duration-300": isRemoving,
          })}
          ref={ref}
          suppressHydrationWarning
          {...cardProps}
        >
          <ItemInner card={card} />
        </div>
        {editable && (
          <div className="absolute right-2 top-2 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-12"
              onClick={handleEdit}
            >
              <PencilLine />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-12"
              onClick={handleRemove}
            >
              <X className="fill-current text-destructive" />
            </Button>
          </div>
        )}
      </article>
    );
  },
);
Item.displayName = "Item";

export type SortableItemProps = Omit<ItemProps, "isDragging">;

export function SortableItem(props: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.card.id,
    disabled: !props.editable,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <Item
      ref={setNodeRef}
      isDragging={isDragging}
      style={style}
      {...attributes}
      {...listeners}
      {...props}
    />
  );
}
