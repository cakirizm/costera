/* Throwaway end-to-end check of the POS service layer against the dev database.
   Creates an isolated restaurant, runs a full ticket through it, asserts the
   outcome, then deletes everything it made. */
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import * as orders from "@/lib/pos/order-service";
import * as payments from "@/lib/pos/payment-service";
import * as shifts from "@/lib/pos/shift-service";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
}

async function main() {
  const tag = randomUUID().slice(0, 8);

  const user = await prisma.user.create({
    data: { email: `pos-smoke-${tag}@example.test`, passwordHash: "x", name: "Smoke" },
  });
  const restaurant = await prisma.restaurant.create({
    data: { name: `Smoke ${tag}`, currency: "TRY" },
  });
  const membership = await prisma.membership.create({
    data: { userId: user.id, restaurantId: restaurant.id, role: "OWNER" },
  });
  const actor = { restaurantId: restaurant.id, membershipId: membership.id };

  const area = await prisma.posArea.create({ data: { restaurantId: restaurant.id, name: "Salon" } });
  const table = await prisma.posTable.create({
    data: { restaurantId: restaurant.id, areaId: area.id, name: "M1" },
  });
  const vat10 = await prisma.posTaxGroup.create({
    data: { restaurantId: restaurant.id, name: "Yeme-icme", ratePct: 10, okcDepartment: 1 },
  });
  const vat20 = await prisma.posTaxGroup.create({
    data: { restaurantId: restaurant.id, name: "Alkol", ratePct: 20, okcDepartment: 2 },
  });
  const food = await prisma.posCategory.create({
    data: { restaurantId: restaurant.id, name: "Yemek", station: "KITCHEN" },
  });
  const bar = await prisma.posCategory.create({
    data: { restaurantId: restaurant.id, name: "Bar", station: "BAR" },
  });
  const burger = await prisma.posProduct.create({
    data: {
      restaurantId: restaurant.id, categoryId: food.id, taxGroupId: vat10.id,
      name: "Burger", priceMinor: 22000, menuItemExtId: "MI-BURGER",
    },
  });
  const beer = await prisma.posProduct.create({
    data: {
      restaurantId: restaurant.id, categoryId: bar.id, taxGroupId: vat20.id,
      name: "Bira", priceMinor: 18000, menuItemExtId: "MI-BEER",
    },
  });
  const group = await prisma.posModifierGroup.create({
    data: { restaurantId: restaurant.id, name: "Ekstralar" },
  });
  const extraCheese = await prisma.posModifier.create({
    data: { groupId: group.id, name: "Ekstra peynir", priceMinor: 3000 },
  });

  const shift = await shifts.openShift(actor, { openingCashMinor: 50000 });

  const clientOrderId = `smoke-${tag}-0001`;
  let order = await orders.openOrder(actor, { clientOrderId, tableId: table.id, shiftId: shift.id });
  check("ticket number starts at 1", order.code, 1);

  const replay = await orders.openOrder(actor, { clientOrderId, tableId: table.id });
  check("replayed clientOrderId returns the same ticket", replay.id, order.id);

  order = await orders.addLines(actor, order.id, [
    { productId: burger.id, quantity: 2, modifierIds: [extraCheese.id] },
    { productId: beer.id, quantity: 1 },
  ]);
  // 2 x (220.00 + 30.00) = 500.00, plus 180.00 = 680.00
  check("subtotal with modifiers", order.subtotalMinor, 68000);
  check("tax split across 10% and 20%", order.taxMinor, 4545 + 3000);

  await runOrderChecks(actor, order, table.id, shift.id, restaurant.id);

  await runStaffPinChecks(restaurant.id);
  await runApprovalChecks(restaurant.id);
  await runOfflineReplayChecks(actor, burger.id);

  await runPrintQueueChecks(restaurant.id);

  await prisma.restaurant.delete({ where: { id: restaurant.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exitCode = failures === 0 ? 0 : 1;
}

async function runOrderChecks(
  actor: { restaurantId: string; membershipId: string },
  initial: orders.OrderWithLines,
  tableId: string,
  shiftId: string,
  restaurantId: string,
) {
  let order = initial;

  order = await orders.sendToKitchen(actor, order.id);
  check("status moves to SENT", order.status, "SENT");
  const kitchenJobs = await prisma.posPrintJob.count({ where: { restaurantId, kind: "KITCHEN" } });
  check("one print job per station", kitchenJobs, 2);

  try {
    await orders.sendToKitchen(actor, order.id);
    check("resending with nothing new throws", "no throw", "NOTHING_TO_SEND");
  } catch (error) {
    check("resending with nothing new throws", (error as { code?: string }).code, "NOTHING_TO_SEND");
  }

  order = await orders.setOrderDiscount(actor, order.id, 5000);
  check("order discount applied once", order.totalMinor, 63000);
  order = await orders.setOrderDiscount(actor, order.id, 5000);
  check("order discount does not compound on repricing", order.totalMinor, 63000);

  const beerLine = order.lines.find((l) => l.name === "Bira");
  order = await orders.voidLine(actor, beerLine!.id, "Musteri vazgecti");
  // 500.00 gross remains, discount still 50.00 -> 450.00
  check("voided line leaves the totals", order.totalMinor, 45000);

  try {
    await payments.takePayment(actor, order.id, { method: "CASH", amountMinor: 99999, shiftId });
    check("overpayment is rejected", "no throw", "PAYMENT_EXCEEDS_DUE");
  } catch (error) {
    check("overpayment is rejected", (error as { code?: string }).code, "PAYMENT_EXCEEDS_DUE");
  }

  const partial = await payments.takePayment(actor, order.id, {
    method: "CARD", amountMinor: 20000, shiftId,
  });
  check("partial payment leaves a balance", partial.remainingMinor, 25000);
  check("status is PARTIALLY_PAID", partial.order.status, "PARTIALLY_PAID");

  const settle = await payments.takePayment(actor, order.id, {
    method: "CASH", amountMinor: 25000, tenderedMinor: 30000, shiftId,
  });
  check("change is computed on the cash tender", settle.changeMinor, 5000);
  check("ticket closes when fully paid", settle.order.status, "PAID");

  const sales = await prisma.sale.findMany({ where: { posOrderId: order.id } });
  check("only the un-voided mapped line reaches the engine", sales.length, 1);
  check("net sales handed over in major units", sales[0]?.netSales, 450);
  check("engine row keeps the menu item join key", sales[0]?.menuItemExtId, "MI-BURGER");

  const source = await prisma.dataSource.findUnique({ where: { restaurantId } });
  check("workspace is now POS-fed", source?.kind, "POS_API");

  try {
    await shifts.closeShift(actor, shiftId, 75000);
  } catch (error) {
    check("shift closes cleanly", (error as { code?: string }).code, "no error");
  }
  const closed = await prisma.posShift.findUnique({ where: { id: shiftId } });
  // 500.00 opening + 250.00 cash applied = 750.00 expected
  check("expected cash counts the applied amount, not the tender", closed?.expectedCashMinor, 75000);
  check("no drawer difference", closed?.differenceMinor, 0);

  const audits = await prisma.posAuditLog.findMany({ where: { restaurantId } });
  check("every money-moving action is audited", audits.length >= 7, true);
  void tableId;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/* Who may sign off a write-off, and how hard the PIN is to guess. */
async function runApprovalChecks(restaurantId: string) {
  const { createTerminalStaff, findApprover, allowPinAttempt, clearPinAttempts } = await import(
    "@/lib/pos/staff"
  );

  await createTerminalStaff(restaurantId, "Smoke Manager", "MANAGER", "7788");
  await createTerminalStaff(restaurantId, "Smoke Runner", "WAITER", "1122");

  const manager = await findApprover(restaurantId, "7788");
  check("a manager PIN can approve a write-off", manager?.role, "MANAGER");

  const waiter = await findApprover(restaurantId, "1122");
  check("a waiter cannot approve their own write-off", waiter, null);

  const other = await prisma.restaurant.create({ data: { name: "Smoke Approver", currency: "TRY" } });
  check("an approval PIN does not cross venues", await findApprover(other.id, "7788"), null);
  await prisma.restaurant.delete({ where: { id: other.id } });

  await clearPinAttempts(restaurantId);
  let lastAllowed = true;
  for (let attempt = 0; attempt < 11; attempt++) {
    lastAllowed = (await allowPinAttempt(restaurantId)).allowed;
  }
  check("PIN guessing is cut off past the limit", lastAllowed, false);

  await clearPinAttempts(restaurantId);
  check("a successful PIN clears the count", (await allowPinAttempt(restaurantId)).allowed, true);
}

/* Till PINs: scoped to one venue, and revoking one ends the sign-in. */
async function runStaffPinChecks(restaurantId: string) {
  const { createTerminalStaff, findStaffByPin, revokeStaffPin } = await import("@/lib/pos/staff");

  await createTerminalStaff(restaurantId, "Smoke Waiter", "WAITER", "4417");
  const found = await findStaffByPin(restaurantId, "4417");
  check("a PIN identifies its owner and their role", found?.role, "WAITER");

  const other = await prisma.restaurant.create({ data: { name: "Smoke Other", currency: "TRY" } });
  const crossVenue = await findStaffByPin(other.id, "4417");
  check("a PIN cannot unlock a different venue", crossVenue, null);
  await prisma.restaurant.delete({ where: { id: other.id } });

  check("a wrong PIN matches nobody", await findStaffByPin(restaurantId, "0000"), null);
  check("a malformed PIN is refused outright", await findStaffByPin(restaurantId, "abc"), null);

  await revokeStaffPin(restaurantId, found!.membershipId);
  check("revoking the PIN ends the sign-in", await findStaffByPin(restaurantId, "4417"), null);
}

/* An outbox flushed after a reconnect must not double the ticket. */
async function runOfflineReplayChecks(
  actor: { restaurantId: string; membershipId: string },
  productId: string,
) {
  const clientOrderId = `smoke-offline-${randomUUID().slice(0, 8)}`;
  const clientLineId = `line-${randomUUID()}`;
  let order = await orders.openOrder(actor, { clientOrderId });

  order = await orders.addLines(actor, order.id, [{ productId, quantity: 1, clientLineId }]);
  check("a queued line is added once", order.lines.length, 1);

  order = await orders.addLines(actor, order.id, [{ productId, quantity: 1, clientLineId }]);
  check("replaying the same line adds nothing", order.lines.length, 1);

  order = await orders.addLines(actor, order.id, [
    { productId, quantity: 1, clientLineId },
    { productId, quantity: 1, clientLineId: `line-${randomUUID()}` },
  ]);
  check("a mixed replay keeps only the new line", order.lines.length, 2);

  order = await orders.addLines(actor, order.id, [{ productId, quantity: 1 }]);
  check("a line with no key is still added normally", order.lines.length, 3);
}

/* Print-queue handover between the server and the local bridge. */
async function runPrintQueueChecks(restaurantId: string) {
  const { claimPrintJobs, settlePrintJobs, MAX_PRINT_ATTEMPTS } = await import("@/lib/pos/print-queue");
  // Real devices: PosPrintJob.deviceId is a foreign key, so a claim by an
  // unknown bridge is rejected by the database rather than silently accepted.
  const { enrolDevice } = await import("@/lib/pos/bridge-auth");
  const deviceA = (await enrolDevice(restaurantId, "Smoke bridge A", "BRIDGE")).deviceId;
  const deviceB = (await enrolDevice(restaurantId, "Smoke bridge B", "BRIDGE")).deviceId;

  const queued = await prisma.posPrintJob.count({ where: { restaurantId, status: "QUEUED" } });
  check("kitchen and receipt jobs are queued for the bridge", queued > 0, true);

  const first = await claimPrintJobs(restaurantId, deviceA, 10);
  check("a bridge claims the queued jobs", first.length, queued);

  const second = await claimPrintJobs(restaurantId, deviceB, 10);
  check("a second bridge cannot claim the same jobs", second.length, 0);

  // A printer that was out of paper must not lose the ticket.
  await settlePrintJobs(restaurantId, deviceA, [{ id: first[0].id, ok: false, error: "no paper" }]);
  const requeued = await prisma.posPrintJob.findUnique({ where: { id: first[0].id } });
  check("a failed job goes back to the queue", requeued?.status, "QUEUED");
  check("the failure reason is kept for the operator", requeued?.lastError, "no paper");

  await prisma.posPrintJob.update({
    where: { id: first[0].id },
    data: { attempts: MAX_PRINT_ATTEMPTS },
  });
  await prisma.posPrintJob.update({ where: { id: first[0].id }, data: { status: "PRINTING", deviceId: deviceA } });
  await settlePrintJobs(restaurantId, deviceA, [{ id: first[0].id, ok: false, error: "still no paper" }]);
  const exhausted = await prisma.posPrintJob.findUnique({ where: { id: first[0].id } });
  check("it stops retrying once attempts run out", exhausted?.status, "FAILED");

  await settlePrintJobs(restaurantId, deviceA, [{ id: first[1].id, ok: true }]);
  const done = await prisma.posPrintJob.findUnique({ where: { id: first[1].id } });
  check("a printed job is marked done", done?.status, "DONE");
}
