import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useLayoutEffect } from "react";

import { getSessionBoard } from "~/api/board";
import { getSessionProfile } from "~/api/profile";
import type { BoardScheme } from "~/api/validator";
import { Board } from "~/components/Board";

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  return {
    profile: await getSessionProfile(),
    board: await getSessionBoard(),
  };
}

const defaultBoard = {
  cards: [],
  createdAt: new Date().toISOString(),
} satisfies BoardScheme;

export default function Index() {
  const { profile, board } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (!profile) {
      navigate("/", { replace: true });
    }
  }, [navigate, profile]);

  if (!profile) {
    return null;
  }
  return <Board profile={profile} board={board ?? defaultBoard} editable />;
}
