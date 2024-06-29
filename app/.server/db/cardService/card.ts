import type { Prisma } from "@prisma/client";

export const deleteManyInBoard = async ({
  tx,
  handleOrDid,
}: {
  tx: Prisma.TransactionClient;
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
