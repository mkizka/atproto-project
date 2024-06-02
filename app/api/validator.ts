import { z } from "zod";

const cardSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  text: z.string().optional(),
});

export type CardScheme = z.infer<typeof cardSchema>;

export const boardScheme = z
  .object({
    $type: z.literal("dev.mkizka.test.profile.board"),
    id: z.string(),
    cards: z.unknown().array(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .partial()
  .transform((data) => {
    const validCards = data.cards?.filter(
      (card): card is CardScheme => cardSchema.safeParse(card).success,
    );
    return { ...data, cards: validCards ?? [] };
  });

export type BoardScheme = z.infer<typeof boardScheme>;
