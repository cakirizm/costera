import { describe, expect, it } from "vitest";
import { businessDayFor, businessDayKey, businessDayRange, venueTime } from "./business-day";

const key = (iso: string) => businessDayKey(businessDayFor(new Date(iso)));

describe("businessDayFor", () => {
  it("keeps an evening ticket on the day it started", () => {
    // 22:00 Istanbul on the 25th
    expect(key("2026-09-25T19:00:00Z")).toBe("2026-09-25");
  });

  it("rolls a post-midnight ticket back to the previous day", () => {
    // 01:30 Istanbul on the 26th is still the evening of the 25th
    expect(key("2026-09-25T22:30:00Z")).toBe("2026-09-25");
  });

  it("starts the new day at the cutoff hour", () => {
    // 05:59 Istanbul -> previous day, 06:00 Istanbul -> new day
    expect(key("2026-09-26T02:59:00Z")).toBe("2026-09-25");
    expect(key("2026-09-26T03:00:00Z")).toBe("2026-09-26");
  });

  it("handles a month boundary", () => {
    expect(key("2026-10-01T01:00:00Z")).toBe("2026-09-30");
  });
});

describe("businessDayRange", () => {
  it("returns a 24 hour half-open window starting at the cutoff", () => {
    const day = businessDayFor(new Date("2026-09-25T19:00:00Z"));
    const { start, end } = businessDayRange(day);
    expect(start.toISOString()).toBe("2026-09-25T03:00:00.000Z");
    expect(end.toISOString()).toBe("2026-09-26T03:00:00.000Z");
  });

  it("covers the instant it was derived from", () => {
    const at = new Date("2026-09-25T22:30:00Z");
    const { start, end } = businessDayRange(businessDayFor(at));
    expect(at >= start && at < end).toBe(true);
  });
});

describe("venueTime", () => {
  it("reports the clock the cashier was reading, not the server's", () => {
    // 00:25 UTC is 03:25 in Istanbul
    expect(venueTime(new Date("2026-09-25T00:25:00Z"))).toBe("03:25");
  });

  it("wraps past midnight", () => {
    expect(venueTime(new Date("2026-09-24T22:30:00Z"))).toBe("01:30");
  });
});
