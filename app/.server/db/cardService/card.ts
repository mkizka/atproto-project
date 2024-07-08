import type { Prisma } from "@prisma/client";

import { prisma } from "../prisma";

export const deleteManyInBoard = async ({
  tx = prisma,
  handleOrDid,
}: {
  tx?: Prisma.TransactionClient;
  handleOrDid: string;
}) => {
  const user = handleOrDid.startsWith("did:")
    ? { did: handleOrDid }
    : { handle: handleOrDid };
  return await tx.card.deleteMany({
    where: {
      board: {
        user,
      },
    },
  });
};
