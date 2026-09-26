/* Exercises the handheld HTTP surface end to end against a running dev server. */
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { enrolDevice } from "@/lib/pos/bridge-auth";
import { createTerminalStaff } from "@/lib/pos/staff";

const BASE = "http://localhost:3000";
let failures = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
}

async function call(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function main() {
  const tag = randomUUID().slice(0, 6);
  const restaurant = await prisma.restaurant.findFirst({ where: { name: "Demo Restaurant" } });
  if (!restaurant) throw new Error("Demo Restaurant not found");

  const phone = await enrolDevice(restaurant.id, `HTTP Phone ${tag}`, "HANDHELD");
  const staff = await createTerminalStaff(restaurant.id, `HTTP Waiter ${tag}`, "WAITER", "8642");

  const unauth = await call("/api/pos/handheld/bootstrap");
  check("bootstrap without a token is 401", unauth.status, 401);

  const badPin = await call("/api/pos/handheld/session", {
    method: "POST",
    body: JSON.stringify({ deviceToken: phone.token, pin: "0000" }),
  });
  check("a wrong PIN is rejected over HTTP", badPin.body?.error, "PIN_REJECTED");

  const signIn = await call("/api/pos/handheld/session", {
    method: "POST",
    body: JSON.stringify({ deviceToken: phone.token, pin: "8642" }),
  });
  check("sign-in succeeds", signIn.status, 200);
  check("the session names the waiter", signIn.body?.staff?.name, `HTTP Waiter ${tag}`);
  const token = signIn.body?.token as string;
  const auth = { authorization: `Bearer ${token}` };

  const boot = await call("/api/pos/handheld/bootstrap", { headers: auth });
  check("bootstrap returns the floor plan", Array.isArray(boot.body?.areas), true);
  check("bootstrap returns the menu", (boot.body?.categories?.length ?? 0) > 0, true);

  const freeTable = boot.body.areas
    .flatMap((a: { tables: { id: string; order: unknown }[] }) => a.tables)
    .find((t: { order: unknown }) => t.order === null);
  check("there is a free table to open", Boolean(freeTable), true);

  const opened = await call("/api/pos/handheld/orders", {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ clientOrderId: `http-${tag}-0001`, tableId: freeTable.id }),
  });
  check("opening a ticket succeeds", opened.status, 200);
  const orderId = opened.body?.id as string;

  const replay = await call("/api/pos/handheld/orders", {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ clientOrderId: `http-${tag}-0001`, tableId: freeTable.id }),
  });
  check("replaying the same clientOrderId returns the same ticket", replay.body?.id, orderId);

  const product = boot.body.categories[0].products[0];
  const lineId = `http-line-${tag}`;
  const added = await call(`/api/pos/handheld/orders/${orderId}/lines`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ items: [{ productId: product.id, clientLineId: lineId, quantity: 2 }] }),
  });
  check("a line is added", added.body?.lines?.length, 1);
  check("the quantity survives the round trip", added.body?.lines?.[0]?.quantity, 2);

  const addedAgain = await call(`/api/pos/handheld/orders/${orderId}/lines`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ items: [{ productId: product.id, clientLineId: lineId, quantity: 2 }] }),
  });
  check("replaying the same line adds nothing", addedAgain.body?.lines?.length, 1);

  const sent = await call(`/api/pos/handheld/orders/${orderId}/send`, { method: "POST", headers: auth });
  check("sending to the kitchen succeeds", sent.status, 200);
  check("the ticket moves to SENT", sent.body?.status, "SENT");

  const resend = await call(`/api/pos/handheld/orders/${orderId}/send`, { method: "POST", headers: auth });
  check("resending with nothing new is refused", resend.body?.error, "NOTHING_TO_SEND");

  const kds = await prisma.posOrderLine.count({
    where: { orderId, status: { in: ["SENT", "PREPARING", "READY"] } },
  });
  check("the line is waiting on the kitchen screen", kds, 1);

  const audit = await prisma.posAuditLog.findFirst({
    where: { action: "ORDER_OPENED", entityId: orderId },
    include: { membership: { include: { user: { select: { name: true } } } } },
  });
  check("the ticket is attributed to the waiter", audit?.membership?.user.name, `HTTP Waiter ${tag}`);

  const signedOut = await call("/api/pos/handheld/session", { method: "DELETE", headers: auth });
  check("sign-out succeeds", signedOut.status, 200);
  const afterOut = await call("/api/pos/handheld/bootstrap", { headers: auth });
  check("the token is dead after sign-out", afterOut.status, 401);

  await prisma.posOrder.deleteMany({ where: { id: orderId } });
  await prisma.posDevice.deleteMany({ where: { id: phone.deviceId } });
  await prisma.membership.deleteMany({ where: { id: staff.membershipId } });

  console.log(failures === 0 ? "\nALL HTTP CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  await prisma.$disconnect();
  process.exitCode = failures === 0 ? 0 : 1;
}

main();
