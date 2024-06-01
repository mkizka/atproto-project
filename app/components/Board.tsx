import type { AppBskyActorDefs } from "@atproto/api";

import type { BoardScheme } from "~/api/validator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/shadcn/ui/avatar";

import { BoardProvider } from "./BoardProvider";
import { Modal } from "./Modal";
import { ModalProvider } from "./ModalProvider";
import { Sortable } from "./Sortable";

type Props = {
  profile: Pick<AppBskyActorDefs.ProfileViewDetailed, "avatar" | "handle">;
  board: BoardScheme;
  editable?: boolean;
};

export function Board({ profile, board, editable }: Props) {
  return (
    <BoardProvider board={board}>
      <ModalProvider>
        <div className="flex flex-col gap-2">
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
      </ModalProvider>
    </BoardProvider>
  );
}
