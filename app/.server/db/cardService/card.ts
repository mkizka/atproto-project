import type { Prisma } from "@prisma/client";
import { ResultAsync } from "neverthrow";

import { toPrismaError } from "~/.server/utils/neverthrow";

export const deleteManyInBoard = ({
  tx,
  handleOrDid,
}: {
  tx: Prisma.TransactionClient;
  handleOrDid: string;
}) => {
  const user = handleOrDid.startsWith("did:")
    ? { did: handleOrDid }
    : { handle: handleOrDid };
  return ResultAsync.fromPromise(
    tx.card.deleteMany({
      where: {
        board: {
          user,
        },
      },
    }),
    toPrismaError,
  );
};
