import type { User } from "@prisma/client";
import { Pencil } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/shadcn/ui/avatar";

import { BoardProvider } from "./BoardProvider";
import { Modal } from "./Modal";
import { ModalProvider } from "./ModalProvider";
import { SaveButton } from "./SaveButton";
import { useSession } from "./SessionProvider";
import { Button } from "./shadcn/ui/button";
import { Sortable } from "./Sortable";
import type { ClientBoard } from "./types";

type Props = {
  className?: string;
};

function GotoEdit({ className }: Props) {
  return (
    <Button className={className} asChild>
      <a href="/edit">
        <Pencil className="size-4" />
        編集画面に行く
      </a>
    </Button>
  );
}

type BoardContentProps = Omit<BoardProps, "board">;

function BoardContent({ user, editable }: BoardContentProps) {
  const session = useSession();
  const isMine = session.data && session.data.handle === user.handle;
  return (
    <div className="relative flex flex-col gap-2">
      {isMine && editable && (
        <SaveButton className="absolute right-2 top-2 flex gap-2" />
      )}
      {isMine && !editable && (
        <GotoEdit className="absolute right-2 top-2 flex gap-2" />
      )}
      <section className="flex w-full justify-center py-4">
        <Avatar className="size-16">
          <AvatarImage src={user.avatar ?? undefined} />
          <AvatarFallback />
        </Avatar>
      </section>
      <section className="flex w-full flex-col gap-2">
        <Sortable editable={editable} />
        {editable && <Modal />}
      </section>
    </div>
  );
}

type BoardProps = {
  user: Pick<User, "avatar" | "handle">;
  board: ClientBoard;
  editable?: boolean;
};

export function Board({ board, ...props }: BoardProps) {
  return (
    <BoardProvider board={board}>
      <ModalProvider>
        <BoardContent {...props} />
      </ModalProvider>
    </BoardProvider>
  );
}
