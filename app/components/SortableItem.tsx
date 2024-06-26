import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LinkIcon, LoaderCircle, PencilLine, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { type FC, forwardRef, useState } from "react";

import { cn } from "~/utils/cn";
import {
  atUri,
  isBlueskyPostUrl,
  isBlueskyProfileUrl,
  isGitHubProfileUrl,
  isTwitterProfileUrl,
} from "~/utils/urls";

import { BlueskyEmbed } from "./BlueskyEmbed";
import { useBoard } from "./BoardProvider";
import { BlueskyIcon } from "./icons/BlueskyIcon";
import { GitHubIcon } from "./icons/GitHubIcon";
import { TwitterIcon } from "./icons/TwitterIcon";
import { useModal } from "./ModalProvider";
import { Button } from "./shadcn/ui/button";
import type { CardProps } from "./shadcn/ui/card";
import { Card } from "./shadcn/ui/card";
import type { ClientCard } from "./types";

type CardIconComponent = FC<ComponentProps<"svg">>;

type ParsedCard =
  | {
      type: "link";
      icon: CardIconComponent;
      text: string;
      url: string;
    }
  | {
      type: "embed";
      blueskyUri: string;
    };

const cardIcons: Record<string, CardIconComponent | undefined> = {
  "bsky.app": BlueskyIcon,
  "x.com": TwitterIcon,
  "twitter.com": TwitterIcon,
  "github.com": GitHubIcon,
};

const parseCard = (card: ClientCard): ParsedCard => {
  const url = new URL(card.url);
  const paths = url.pathname.split("/");
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
      text: card.text || `@${paths[2]}`,
      url: card.url,
    };
  }
  if (isTwitterProfileUrl(url)) {
    return {
      type: "link",
      icon: TwitterIcon,
      text: card.text || `@${paths[1]}`,
      url: card.url,
    };
  }
  if (isGitHubProfileUrl(url)) {
    return {
      type: "link",
      icon: GitHubIcon,
      text: card.text || `@${paths[1]}`,
      url: card.url,
    };
  }
  return {
    type: "link",
    icon: cardIcons[url.hostname] || LinkIcon,
    text: card.text || card.url,
    url: card.url,
  };
};

type ItemInnerProps = {
  card: ClientCard;
  editable?: boolean;
};

function ItemInner({ card, editable }: ItemInnerProps) {
  const parsed = parseCard(card);

  if (parsed.type === "embed") {
    return (
      <div className="relative size-full">
        {/* クリック領域に被せて並び替え可能にする */}
        {editable && <div className="absolute size-full" />}
        <BlueskyEmbed blueskyUri={parsed.blueskyUri} />
        <LoaderCircle className="absolute inset-0 -z-10 m-auto size-8 animate-spin stroke-current text-muted-foreground" />
      </div>
    );
  }
  const cardProps = editable
    ? ({ as: "div" } as const)
    : ({ as: "a", href: parsed.url } as const);
  return (
    <Card
      {...cardProps}
      className="flex h-16 min-w-0 flex-1 items-center gap-4 p-4"
    >
      <parsed.icon className="size-8" />
      <p className="flex-1 truncate">{parsed.text}</p>
    </Card>
  );
}

type ItemProps = {
  card: ClientCard;
  children?: ReactNode;
  editable?: boolean;
  isOverlay?: boolean;
  isDragging?: boolean;
  isSorting?: boolean;
} & CardProps;

export const Item = forwardRef<HTMLDivElement, ItemProps>(
  ({ card, editable, isDragging, isOverlay, isSorting, ...cardProps }, ref) => {
    const { setOpen } = useModal();
    const { removeCard } = useBoard();
    const [isRemoving, setIsRemoving] = useState(false);

    const handleEdit = () => {
      setOpen(true, card.id);
    };

    const handleRemove = () => {
      const ok = confirm(`${card.url} を削除しますか？`);
      if (!ok) return;
      setIsRemoving(true);
      setTimeout(() => {
        removeCard(card.id);
      }, 200);
    };

    return (
      <article className="relative">
        <div
          // > We highly recommend you specify the touch-action CSS property for all of your draggable elements.
          // https://docs.dndkit.com/api-documentation/sensors/pointer#touch-action
          className={cn("flex w-full items-center touch-none", {
            // DragOverlayでなければホバー時に半透明にする
            "hover:opacity-80": !isOverlay,
            // ドラッグ中のDragOverlayでない方は半透明にする
            "opacity-30": isDragging,
            // DragOverlayは拡大しておき100%スタートの拡大アニメーションをつける
            "animate-in zoom-in-100 scale-[103%] shadow-2xl": isOverlay,
            "animate-out zoom-out-90 fade-out duration-300": isRemoving,
          })}
          ref={ref}
          suppressHydrationWarning
          {...cardProps}
        >
          <ItemInner card={card} editable={editable} />
        </div>
        {editable && !isSorting && (
          <div className="absolute right-2 top-2 flex gap-2 opacity-80">
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

export type SortableItemProps = {
  card: ClientCard;
  editable?: boolean;
};

export function SortableItem({ card, editable }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({
    id: card.id,
    disabled: !editable,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <Item
      ref={setNodeRef}
      card={card}
      editable={editable}
      isDragging={isDragging}
      isSorting={isSorting}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
}
