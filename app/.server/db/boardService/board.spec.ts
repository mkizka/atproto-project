import { UserFactory } from "~/.server/factories/user";
import type { BoardScheme } from "~/api/validator";

import { boardService } from ".";

vi.mock("../userService");

const dummyBoard: BoardScheme = {
  $type: "dev.mkizka.test.profile.board",
  id: "dummy-board",
  cards: [
    {
      id: "dummy-card",
      url: "https://example.com",
      text: "テキスト",
    },
  ],
};

const mockedNow = new Date("2024-01-01T00:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
});

describe("boardService", () => {
  describe("createBoard", () => {
    test("ボードを作成できる", async () => {
      // arrange
      vi.setSystemTime(mockedNow);
      const user = await UserFactory.create(); // findOrFetchUserが作成するユーザー
      // act
      const actual = await boardService.createBoard(user.did, dummyBoard);
      // assert
      expect(actual.userDid).toBe(user.did);
    });
  });
});
