import { Prisma } from "@prisma/client";
import type { Result } from "neverthrow";

export const toPrismaError = (
  error: unknown,
): Prisma.PrismaClientKnownRequestError | Error => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error;
  }
  return new Error("Unknown Error", { cause: error });
};

export const isErrorOrNotNull = <T>(
  result: Result<T | null, unknown>,
): result is Result<T, unknown> => {
  return result.isErr() || result.value !== null;
};
