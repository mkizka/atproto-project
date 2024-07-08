import { defineBoardFactory } from "~/generated/fabbrica";

import { UserFactory } from "./user";

export const BoardFactory = defineBoardFactory({
  defaultData: {
    user: UserFactory,
  },
});
