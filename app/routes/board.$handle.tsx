import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { boardService } from "~/.server/db/boardService";
import { userService } from "~/.server/db/userService";
import { Board } from "~/components/Board";

export async function loader({ params }: LoaderFunctionArgs) {
  const handleOrDid = params.handle!;
  const profile = await userService.findOrFetchUser({ handleOrDid });
  if (!profile) {
    return redirect("/");
  }
  const board = await boardService.findOrFetchBoard({ handleOrDid });
  if (!board) {
    return redirect("/");
  }
  return json({
    profile,
    board,
  });
}

export default function Index() {
  const { profile, board } = useLoaderData<typeof loader>();
  return <Board user={profile} board={board} />;
}
