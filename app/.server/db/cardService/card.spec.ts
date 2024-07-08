import { describe, expect } from "vitest";

import { BoardFactory } from "~/.server/factories/board";
import { CardFactory } from "~/.server/factories/card";

import { prisma } from "../prisma";
import { cardService } from ".";

describe("cardService", () => {
  test("deleteManyInBoard", async () => {
    // arrange
    await BoardFactory.create({
      cards: {
        create: await CardFactory.buildList(3),
      },
    });
    const user = await prisma.user.findFirst();
    // act
    await cardService.deleteManyInBoard({
      handleOrDid: user!.did,
    });
    // arrange
    expect(await prisma.card.count()).toBe(0);
  });
});
