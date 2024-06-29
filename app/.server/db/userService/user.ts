import type { AppBskyActorDefs } from "@atproto/api";
import type { Prisma, User } from "@prisma/client";
import type { Result } from "neverthrow";
import { ok, ResultAsync } from "neverthrow";

import { isErrorOrNotNull, toPrismaError } from "~/.server/utils/errors";
import { createLogger } from "~/.server/utils/logger";
import { publicBskyAgent } from "~/api/agent";

import { prisma } from "../prisma";

const logger = createLogger("userService");

const findUser = ({
  tx,
  handleOrDid,
}: {
  tx: Prisma.TransactionClient;
  handleOrDid: string;
}) => {
  const where = handleOrDid.startsWith("did:")
    ? { did: handleOrDid }
    : { handle: handleOrDid };
  return ResultAsync.fromPromise(
    tx.user.findUnique({
      where,
    }),
    toPrismaError,
  );
};

const createUser = ({
  tx,
  blueskyProfile,
}: {
  tx: Prisma.TransactionClient;
  blueskyProfile: AppBskyActorDefs.ProfileViewDetailed;
}) => {
  return ResultAsync.fromPromise(
    tx.user.create({
      data: {
        did: blueskyProfile.did,
        description: blueskyProfile.description,
        displayName: blueskyProfile.displayName,
        handle: blueskyProfile.handle,
      },
    }),
    toPrismaError,
  );
};

const safeGetProfile = ResultAsync.fromThrowable(publicBskyAgent.getProfile);

const fetchUser = async ({
  tx,
  handleOrDid,
}: {
  tx: Prisma.TransactionClient;
  handleOrDid: string;
}) => {
  logger.info("プロフィールを取得します", { actor: handleOrDid });
  const blueskyProfile = await safeGetProfile({
    actor: handleOrDid,
  });
  if (blueskyProfile.isErr()) {
    logger.warn("プロフィールの取得に失敗しました", {
      error: blueskyProfile.error,
    });
    return ok(null);
  }
  return await createUser({
    tx,
    blueskyProfile: blueskyProfile.value.data,
  });
};

export const findOrFetchUser = async ({
  tx = prisma,
  handleOrDid,
}: {
  tx?: Prisma.TransactionClient;
  handleOrDid: string;
}): Promise<Result<User | null, Error>> => {
  const user = await findUser({ tx, handleOrDid });
  if (isErrorOrNotNull(user)) {
    return user;
  }
  return fetchUser({ tx, handleOrDid });
};
