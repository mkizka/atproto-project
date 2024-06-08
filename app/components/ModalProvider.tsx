import { FormProvider, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ResultAsync } from "neverthrow";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { z } from "zod";

import type { CardScheme } from "~/api/validator";
import { resolveHandleIfNeeded } from "~/utils/urls";

import { useBoard } from "./BoardProvider";

type ModalContextValue = {
  formId: string;
  editingCard: CardScheme | null;
  open: boolean;
  setOpen: (open: boolean, cardId?: string) => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

const schema = z
  .object({
    url: z.string().url({ message: "URLを入力してください" }),
    text: z.string().optional(),
    id: z.string().optional(),
  })
  .refine(
    (data) => {
      return data.url || data.text;
    },
    { message: "テキストかURLどちらかを入力してください" },
  );

type Schema = z.infer<typeof schema>;

type Props = {
  children: ReactNode;
};

const resolveHandle = ResultAsync.fromThrowable(
  async (card: Schema) => {
    if (!card.url) return card;
    return {
      ...card,
      url: await resolveHandleIfNeeded(card.url),
    };
  },
  () => "Blueskyのハンドルを解決出来ませんでした",
);

export function ModalProvider({ children }: Props) {
  const [open, setOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardScheme | null>(null);
  const board = useBoard();

  const [form] = useForm<Schema>({
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    onSubmit: async (event, { submission }) => {
      event.preventDefault();
      if (!submission) throw new Error("予期せぬエラーが発生しました");
      const formCard = submission.payload as Schema;
      const resolvedCard = await resolveHandle(formCard);
      if (resolvedCard.isErr()) {
        alert(resolvedCard.error);
        return;
      }
      if (resolvedCard.value.id) {
        board.replaceCard({ ...resolvedCard.value, id: resolvedCard.value.id });
      } else {
        board.addCard(resolvedCard.value);
      }
      setOpen(false);
    },
  });

  const handleOpen: ModalContextValue["setOpen"] = (open, cardId) => {
    setOpen(open);
    const card = board.value.cards.find((card) => card.id === cardId);
    setEditingCard(card ?? null);
  };

  return (
    <FormProvider context={form.context}>
      <ModalContext.Provider
        value={{ formId: form.id, editingCard, open, setOpen: handleOpen }}
      >
        {children}
      </ModalContext.Provider>
    </FormProvider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === null) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
