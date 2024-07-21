import { server } from "~/mocks/server";

import { initialize, resetSequence } from "../app/generated/fabbrica";

beforeEach(() => {
  vi.useFakeTimers();
});
afterAll(() => {
  // なぜかテストが完了しなかったので追加
  vi.useRealTimers();
});

// prisma
vi.mock("~/.server/db/prisma", () => ({
  prisma: vPrisma.client,
}));
beforeAll(() => {
  initialize({
    prisma: () => vPrisma.client,
  });
});
beforeEach(() => resetSequence());

// msw
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
