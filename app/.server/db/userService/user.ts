import type { AppBskyActorDefs } from "@atproto/api";
import type { Prisma } from "@prisma/client";
import { okAsync, ResultAsync } from "neverthrow";

import { createLogger } from "~/.server/utils/logger";
import { toPrismaError, toXRPCError } from "~/.server/utils/neverthrow";
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

const safeGetProfile = (handleOrDid: string) => {
  const promise = ResultAsync.fromPromise(
    publicBskyAgent.getProfile({ actor: handleOrDid }),
    toXRPCError,
  )
    .mapErr((error) => {
      logger.warn("プロフィールの取得に失敗しました", {
        error,
      });
      return error;
    })
    .unwrapOr(null);
  return ResultAsync.fromSafePromise(promise);
};

const fetchUser = ({
  tx,
  handleOrDid,
}: {
  tx: Prisma.TransactionClient;
  handleOrDid: string;
}) => {
  logger.info("プロフィールを取得します", { actor: handleOrDid });
  return safeGetProfile(handleOrDid).andThen((blueskyProfile) => {
    if (!blueskyProfile) {
      return okAsync(null);
    }
    return createUser({
      tx,
      blueskyProfile: blueskyProfile.data,
    });
  });
};

export const findOrFetchUser = ({
  tx = prisma,
  handleOrDid,
}: {
  tx?: Prisma.TransactionClient;
  handleOrDid: string;
}) => {
  return findUser({ tx, handleOrDid }).andThen((user) => {
    if (user) {
      return okAsync(user);
    }
    return fetchUser({ tx, handleOrDid });
  });
};
