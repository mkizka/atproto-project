import { defineCardFactory } from "~/generated/fabbrica";

import { BoardFactory } from "./board";

export const CardFactory = defineCardFactory({
  defaultData: ({ seq }) => ({
    url: `https://test${seq}.example.com`,
    board: BoardFactory,
  }),
});
