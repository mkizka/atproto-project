import type { AppBskyActorDefs } from "@atproto/api";
import type { Prisma } from "@prisma/client";

import { createLogger } from "~/.server/utils/logger";
import { publicBskyAgent } from "~/api/agent";

import { prisma } from "../prisma";

const logger = createLogger("userService");

const findUser = async ({
  tx,
  handleOrDid,
}: {
  tx: Prisma.TransactionClient;
  handleOrDid: string;
}) => {
  const where = handleOrDid.startsWith("did:")
    ? { did: handleOrDid }
    : { handle: handleOrDid };
  return await tx.user.findUnique({
    where,
  });
};

const createUser = async ({
  tx,
  blueskyProfile,
}: {
  tx: Prisma.TransactionClient;
  blueskyProfile: AppBskyActorDefs.ProfileViewDetailed;
}) => {
  return await tx.user.create({
    data: {
      did: blueskyProfile.did,
      description: blueskyProfile.description,
      displayName: blueskyProfile.displayName,
      handle: blueskyProfile.handle,
    },
  });
};

const fetchBlueskyProfile = async (actor: string) => {
  const response = await publicBskyAgent.getProfile({
    actor,
  });
  if (!response.success) {
    return null;
  }
  return response.data;
};

export const findOrFetchUser = async ({
  tx = prisma,
  handleOrDid,
}: {
  tx?: Prisma.TransactionClient;
  handleOrDid: string;
}) => {
  const user = await findUser({ tx, handleOrDid });
  if (user) {
    return user;
  }
  const blueskyProfile = await fetchBlueskyProfile(handleOrDid);
  if (!blueskyProfile) {
    logger.warn("プロフィールの取得に失敗しました");
    return null;
  }
  return await createUser({
    tx,
    blueskyProfile,
  });
};
