import type { AppBskyActorDefs } from "@atproto/api";
import type { Prisma } from "@prisma/client";

import { publicBskyAgent } from "~/api/agent";
import type { BoardScheme } from "~/api/validator";

export const deleteAllCardsInBoard = async ({
  tx,
  userDid,
}: {
  tx: Prisma.TransactionClient;
  userDid: string;
}) => {
  return await tx.card.deleteMany({
    where: {
      board: {
        userDid,
      },
    },
  });
};

export const upsertBoard = async ({
  tx,
  userDid,
  board,
}: {
  tx: Prisma.TransactionClient;
  userDid: string;
  board: BoardScheme;
}) => {
  const data = {
    user: {
      connect: {
        did: userDid,
      },
    },
    cards: {
      create: board.cards.map((card, index) => ({
        url: card.url,
        text: card.text,
        order: index,
      })),
    },
  } satisfies Prisma.BoardUpsertArgs["create"];
  return await tx.board.upsert({
    where: {
      userDid,
    },
    update: data,
    create: data,
  });
};

export const createUser = async ({
  tx,
  userDid,
  blueskyUser,
}: {
  tx: Prisma.TransactionClient;
  userDid: string;
  blueskyUser: AppBskyActorDefs.ProfileViewDetailed;
}) => {
  return await tx.user.create({
    data: {
      did: userDid,
      description: blueskyUser.description,
      displayName: blueskyUser.displayName,
      handle: blueskyUser.handle,
    },
  });
};

export const findUser = async ({
  tx,
  userDid,
}: {
  tx: Prisma.TransactionClient;
  userDid: string;
}) => {
  return await tx.user.findUnique({
    where: {
      did: userDid,
    },
  });
};

export const getBlueskyProfile = async (userDid: string) => {
  const response = await publicBskyAgent.getProfile({
    actor: userDid,
  });
  if (!response.success) {
    throw new Error("Blueskyからのユーザー取得に失敗しました");
  }
  return response.data;
};
