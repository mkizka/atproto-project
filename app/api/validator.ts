import { z } from "zod";

export const cardSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  text: z.string().optional(),
});

export type CardScheme = z.infer<typeof cardSchema>;

export const rawBoardScheme = z
  .object({
    $type: z.literal("dev.mkizka.test.profile.board"),
    id: z.string(),
    // 後でcardSchemaでフィルタするのでカードの内容はこの限りでなくてもいい
    cards: cardSchema.partial().array(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  // cards以外は使い道を決めていないのでoptionalにしておく
  .partial();

export type RawBoardScheme = z.infer<typeof rawBoardScheme>;

export type BoardScheme = Omit<RawBoardScheme, "cards"> & {
  cards: CardScheme[];
};
