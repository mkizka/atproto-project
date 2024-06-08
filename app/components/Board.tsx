import type { AppBskyActorDefs } from "@atproto/api";
import { Pencil } from "lucide-react";

import type { BoardScheme } from "~/api/validator";
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

type BoardContentProps = {
  profile: Pick<AppBskyActorDefs.ProfileViewDetailed, "avatar" | "handle">;
  editable?: boolean;
};

function BoardContent({ profile, editable }: BoardContentProps) {
  const session = useSession();
  const isMine = session.data && session.data.handle === profile.handle;
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
          <AvatarImage src={profile.avatar} />
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
  board: BoardScheme;
} & BoardContentProps;

export function Board({ board, ...props }: BoardProps) {
  return (
    <BoardProvider board={board}>
      <ModalProvider>
        <BoardContent {...props} />
      </ModalProvider>
    </BoardProvider>
  );
}
