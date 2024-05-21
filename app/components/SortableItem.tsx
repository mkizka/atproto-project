import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LinkIcon, LoaderCircle, X } from "lucide-react";
import type { ReactNode } from "react";
import { type FC, forwardRef, useEffect, useRef, useState } from "react";

import type { CardScheme } from "~/api/validator";
import { cn } from "~/utils/cn";

import { BlueskyIcon } from "./board/icons/BlueskyIcon";
import { Button } from "./shadcn/ui/button";
import type { CardProps } from "./shadcn/ui/card";
import { Card } from "./shadcn/ui/card";

// https://bsky.app/profile/example.com
const isBlueskyProfileUrl = (hostname: string, paths: string[]) => {
  return (
    hostname === "bsky.app" && paths[1] === "profile" && paths.length === 3
  );
};

// https://bsky.app/profile/example.com/post/12345...
const isBlueskyPostUrl = (hostname: string, paths: string[]) => {
  return (
    hostname === "bsky.app" &&
    paths[1] === "profile" &&
    paths[3] === "post" &&
    paths.length === 5
  );
};

type ParsedCard =
  | {
      type: "link";
      icon: FC<React.SVGProps<SVGSVGElement>>;
      text: string;
      url: string;
    }
  | {
      type: "embed";
      url: string;
    };

const parseCard = (card: CardScheme): ParsedCard => {
  const url = new URL(card.url);
  const paths = url.pathname.split("/");
  if (isBlueskyPostUrl(url.hostname, paths)) {
    return {
      type: "embed",
      url: card.url,
    };
  }
  if (isBlueskyProfileUrl(url.hostname, paths)) {
    return {
      type: "link",
      icon: BlueskyIcon,
      text: paths[2],
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
  const id = useRef(crypto.randomUUID());
  const parsed = parseCard(card);

  useEffect(() => {
    if (parsed.type !== "embed") return;
    const script = document.createElement("script");
    script.id = id.current;
    script.src = "https://embed.bsky.app/static/embed.js";
    script.async = true;

    document.body.appendChild(script);
    return () => {
      document.getElementById(id.current)?.remove();
    };
    // TODO: eslint-plugin-reactとか入れる
  }, [parsed.type]);

  if (parsed.type === "embed") {
    return (
      <div className="relative size-full">
        <div className="absolute size-full" />
        <blockquote data-bluesky-uri="at://did:plc:4gow62pk3vqpuwiwaslcwisa/app.bsky.feed.post/3ksyp4qfpiz2t" />
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
    { card, removeCard, disabled, isDragging, isOverlay, ...cardProps },
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
      <div
        {...cardProps}
        // > We highly recommend you specify the touch-action CSS property for all of your draggable elements.
        // https://docs.dndkit.com/api-documentation/sensors/pointer#touch-action
        className={cn("flex relative w-full items-center touch-none", {
          "opacity-30": isDragging,
          // DragOverlayは拡大しておき100%スタートの拡大アニメーションをつける
          "animate-in zoom-in-100 scale-[103%] shadow-2xl": isOverlay,
          "animate-out zoom-out-90 fade-out duration-300": isRemoving,
        })}
        ref={ref}
      >
        <ItemInner card={card} />
        {!disabled && (
          <div className="absolute right-0 flex gap-2 p-4">
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
      </div>
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
