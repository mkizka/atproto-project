import type { Prisma } from "@prisma/client";

export const deleteManyInBoard = async ({
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
