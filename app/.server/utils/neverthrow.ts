import { XRPCError } from "@atproto/xrpc";
import { Prisma } from "@prisma/client";

export const tap =
  <T>(fn: (v1: T) => void) =>
  (v2: T) => {
    fn(v2);
    return v2;
  };

export const toPrismaError = (
  error: unknown,
): Prisma.PrismaClientKnownRequestError | Error => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error;
  }
  return new Error("Unknown Error", { cause: error });
};

export const toXRPCError = (error: unknown): XRPCError | Error => {
  if (error instanceof XRPCError) {
    return error;
  }
  return new Error("Unknown Error", { cause: error });
};
