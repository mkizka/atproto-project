import { forwardRef } from "react";

import { cn } from "~/utils/cn";

// https://zenn.dev/andynuma/articles/c7f6d6587c116d
type CardProps<T extends React.ElementType> = {
  as?: T;
  children: React.ReactNode;
};

type Props<T extends React.ElementType = "div"> = CardProps<T> &
  Omit<React.ComponentProps<T>, keyof CardProps<T>>;

export const Card = forwardRef<HTMLDivElement, Props>(
  ({ children, className, as, ...props }, ref) => {
    const TagName = as || "div";
    return (
      <TagName
        ref={ref}
        className={cn(
          "rounded-lg border bg-card p-4 text-card-foreground shadow-sm",
          className,
        )}
        {...props}
      >
        {children}
      </TagName>
    );
  },
);
