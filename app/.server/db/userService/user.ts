import type { AppBskyActorDefs } from "@atproto/api";
import type { Prisma } from "@prisma/client";

import { createLogger } from "~/.server/utils/logger";
import { publicBskyAgent } from "~/api/agent";
import { tryCatch } from "~/utils/tryCatch";

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

const fetchBlueskyProfile = async (handleOrDid: string) => {
  logger.info("プロフィールを取得します", { actor: handleOrDid });
  const response = await publicBskyAgent.getProfile({
    actor: handleOrDid,
  });
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
  const blueskyProfile = await tryCatch(fetchBlueskyProfile)(handleOrDid);
  if (blueskyProfile instanceof Error) {
    logger.warn("プロフィールの取得に失敗しました", { error: blueskyProfile });
    return null;
  }
  return await createUser({
    tx,
    blueskyProfile,
  });
};
