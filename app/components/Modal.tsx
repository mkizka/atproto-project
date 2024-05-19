import type { DialogProps } from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import { useRef } from "react";

import { Button } from "./shadcn/ui/button";
import { Card } from "./shadcn/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./shadcn/ui/dialog";
import { Input } from "./shadcn/ui/input";

type Props = {
  onSubmit: (input: string) => void;
} & DialogProps;

export function Modal({ onSubmit, ...props }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Dialog {...props}>
      {!props.open && (
        <DialogTrigger asChild>
          <Card
            as="button"
            className="flex h-16 items-center justify-center animate-in zoom-in-90 hover:opacity-70"
          >
            <CirclePlus className="stroke-current text-muted-foreground" />
          </Card>
        </DialogTrigger>
      )}
      <DialogContent className="top-48 max-w-[90vw] sm:max-w-[600px]">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (ref.current) {
              onSubmit(ref.current.value);
              ref.current.value = "";
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>URLを追加</DialogTitle>
            <DialogDescription>Bluesky以外のURLも使えます</DialogDescription>
          </DialogHeader>
          <Input
            id="url"
            ref={ref}
            placeholder="https://bsky.app/profile/..."
            className="w-full"
            required
          />
          <DialogFooter>
            <Button type="submit">追加</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
