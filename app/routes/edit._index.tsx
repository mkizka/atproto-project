import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { boardService } from "~/.server/db/boardService";
import { userService } from "~/.server/db/userService";
import { createLogger } from "~/.server/utils/logger";
import { tap } from "~/.server/utils/neverthrow";
import { Board } from "~/components/Board";
import type { ClientBoard } from "~/components/types";

const defaultBoard: ClientBoard = {
  cards: [],
};

const logger = createLogger("/edit");

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const handleOrDid = url.searchParams.get("base");
  if (!handleOrDid) {
    return redirect("/");
  }
  const profile = await userService.findOrFetchUser({ handleOrDid });
  if (profile.isErr() || profile.value === null) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  const board = await boardService
    .findOrFetchBoard({ handleOrDid })
    .mapErr(
      tap((error) => logger.error("boardService.findOrFetchBoard", { error })),
    )
    .map((board) => board ?? defaultBoard);
  return json({
    board: board.unwrapOr(defaultBoard),
    profile: profile.value,
  });
}

export default function Index() {
  const { profile, board } = useLoaderData<typeof loader>();
  return <Board user={profile} board={board} editable />;
}
