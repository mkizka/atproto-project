import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { boardService } from "~/.server/db/boardService";
import { userService } from "~/.server/db/userService";
import { Board } from "~/components/Board";
import type { ClientBoard } from "~/components/types";

const defaultBoard: ClientBoard = {
  cards: [],
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const base = url.searchParams.get("base");
  if (!base) {
    return redirect("/");
  }
  const profile = await userService.findOrFetchUser({ handleOrDid: base });
  if (!profile) {
    return redirect("/");
  }
  const board = await boardService.findBoard({ handleOrDid: base });
  return json({
    profile,
    board: board ?? defaultBoard,
  });
}

export default function Index() {
  const { profile, board } = useLoaderData<typeof loader>();
  return <Board user={profile} board={board} editable />;
}
