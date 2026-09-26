import { z } from "zod";

/**
 * Wire contract for the waiter handheld.
 *
 * Shared by the server routes and the Expo app so the two cannot drift. Kept
 * apart from mobile-contract.ts on purpose: that one describes the owner's
 * read-only monitor, this one writes orders and is authenticated completely
 * differently - by an enrolled device plus a staff PIN, never by a password.
 */

export const enrolSchema = z.object({
  /** The one-time token issued in Dashboard > Integrations. */
  deviceToken: z.string().trim().min(20).max(128),
});

export const handheldSignInSchema = z.object({
  pin: z.string().trim().regex(/^[0-9]{4,6}$/),
});

export const handheldSessionSchema = z.object({
  token: z.string().min(40).max(128),
  expiresAt: z.string().datetime(),
  staff: z.object({
    membershipId: z.string(),
    name: z.string(),
    role: z.string(),
  }),
  venue: z.object({ id: z.string(), name: z.string(), currency: z.string() }),
  device: z.object({ id: z.string(), name: z.string() }),
});

const modifierSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceMinor: z.number().int(),
});

export const handheldMenuSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      products: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          priceMinor: z.number().int(),
          isMapped: z.boolean(),
          modifierGroups: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              required: z.boolean(),
              maxSelect: z.number().int(),
              modifiers: z.array(modifierSchema),
            }),
          ),
        }),
      ),
    }),
  ),
});

export const handheldFloorSchema = z.object({
  areas: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      tables: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          seats: z.number().int(),
          order: z
            .object({
              id: z.string(),
              code: z.number().int(),
              totalMinor: z.number().int(),
              openedAt: z.string().datetime(),
            })
            .nullable(),
        }),
      ),
    }),
  ),
});

export const handheldOrderSchema = z.object({
  id: z.string(),
  code: z.number().int(),
  status: z.string(),
  tableName: z.string().nullable(),
  subtotalMinor: z.number().int(),
  discountMinor: z.number().int(),
  taxMinor: z.number().int(),
  totalMinor: z.number().int(),
  lines: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number().int(),
      lineTotalMinor: z.number().int(),
      status: z.string(),
      note: z.string().nullable(),
      modifiers: z.array(z.string()),
    }),
  ),
});

export const openOrderSchema = z.object({
  clientOrderId: z.string().trim().min(8).max(64),
  tableId: z.string().trim().min(1).max(64).nullable(),
});

export const addLinesSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).max(64),
        clientLineId: z.string().trim().min(8).max(64),
        quantity: z.number().int().min(1).max(99),
        note: z.string().trim().max(200).nullish(),
        modifierIds: z.array(z.string().trim().min(1).max(64)).max(20).optional(),
      }),
    )
    .min(1)
    .max(50),
});

export type HandheldSession = z.infer<typeof handheldSessionSchema>;
export type HandheldMenu = z.infer<typeof handheldMenuSchema>;
export type HandheldFloor = z.infer<typeof handheldFloorSchema>;
export type HandheldOrder = z.infer<typeof handheldOrderSchema>;

/** Every failure the handheld can be told about, so the app can phrase them. */
export const HANDHELD_ERRORS = [
  "UNAUTHORIZED",
  "DEVICE_UNKNOWN",
  "PIN_REJECTED",
  "TOO_MANY_ATTEMPTS",
  "NOT_A_WAITER",
  "INVALID_REQUEST",
  "ORDER_NOT_FOUND",
  "ORDER_CLOSED",
  "TABLE_BUSY",
  "TABLE_NOT_FOUND",
  "PRODUCT_NOT_FOUND",
  "NOTHING_TO_SEND",
  "SERVER_ERROR",
] as const;

export type HandheldError = (typeof HANDHELD_ERRORS)[number];
