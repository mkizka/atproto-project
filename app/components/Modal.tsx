import { CirclePlus } from "lucide-react";

import { ModalForm } from "./ModalForm";
import { useModal } from "./ModalProvider";
import { Card } from "./shadcn/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./shadcn/ui/dialog";

type Props = {
  onSubmit: (input: string) => void;
};

export function Modal({ onSubmit }: Props) {
  const { open, setOpen } = useModal();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card
          as="button"
          className="flex h-16 items-center justify-center gap-2 text-muted-foreground hover:opacity-70"
        >
          <CirclePlus className="stroke-current" />
          <p className="mr-6">カードを追加</p>
        </Card>
      </DialogTrigger>
      <DialogContent className="top-48 max-w-[90vw] gap-2 sm:max-w-screen-sm">
        <DialogHeader>
          <DialogTitle>カードを追加</DialogTitle>
        </DialogHeader>
        <ModalForm onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
