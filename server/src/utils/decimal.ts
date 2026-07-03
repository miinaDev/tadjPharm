import type { Decimal } from "@prisma/client/runtime/library";

export function toNumber(value: Decimal | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "number" ? value : Number(value.toString());
}
