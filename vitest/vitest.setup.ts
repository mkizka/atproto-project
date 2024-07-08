import { vi } from "vitest";

import { initialize, resetSequence } from "../app/generated/fabbrica";

vi.mock("~/.server/db/prisma", () => ({
  prisma: vPrisma.client,
}));

beforeAll(() => {
  initialize({
    prisma: () => vPrisma.client,
  });
});

beforeEach(() => resetSequence());
