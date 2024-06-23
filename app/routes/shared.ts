import { prisma } from "~/.server/db/prisma";

export const findProfileAndBoard = async (handle: string) => {
  const profile = await prisma.user.findUnique({
    where: {
      handle,
    },
    include: {
      board: {
        select: {
          cards: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });
  if (!profile?.board) {
    return null;
  }
  return {
    profile,
    board: profile.board,
  };
};
