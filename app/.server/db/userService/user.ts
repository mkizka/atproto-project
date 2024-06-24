import type { AppBskyActorDefs } from "@atproto/api";
import type { Prisma } from "@prisma/client";

import { publicBskyAgent } from "~/api/agent";

import { prisma } from "../prisma";

const findUser = async ({
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

const createUser = async ({
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

const fetchBlueskyUser = async (userDid: string) => {
  const response = await publicBskyAgent.getProfile({
    actor: userDid,
  });
  if (!response.success) {
    throw new Error("Blueskyからのユーザー取得に失敗しました");
  }
  return response.data;
};

export const findOrFetchUser = async ({
  tx = prisma,
  userDid,
}: {
  tx: Prisma.TransactionClient;
  userDid: string;
}) => {
  const user = await findUser({ tx, userDid });
  if (user) {
    return user;
  }
  const blueskyUser = await fetchBlueskyUser(userDid);
  return await createUser({
    tx,
    userDid,
    blueskyUser,
  });
};
