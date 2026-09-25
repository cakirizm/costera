import { beforeAll, describe, expect, it } from "vitest";
import { openStaffCookie, sealStaffCookie } from "./staff-session";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-for-staff-cookie";
});

describe("staff cookie", () => {
  it("round-trips a membership id", () => {
    expect(openStaffCookie(sealStaffCookie("membership-123"))).toBe("membership-123");
  });

  it("rejects a cookie whose membership was swapped for someone else's", () => {
    const sealed = sealStaffCookie("waiter-membership");
    const forged = "manager-membership." + sealed.split(".").pop();
    expect(openStaffCookie(forged)).toBeNull();
  });

  it("rejects a tampered signature", () => {
    const sealed = sealStaffCookie("membership-123");
    expect(openStaffCookie(sealed.slice(0, -1) + "x")).toBeNull();
  });

  it("rejects malformed and missing cookies", () => {
    expect(openStaffCookie(undefined)).toBeNull();
    expect(openStaffCookie("")).toBeNull();
    expect(openStaffCookie("no-signature")).toBeNull();
    expect(openStaffCookie(".onlysignature")).toBeNull();
  });

  it("keeps ids that contain dots intact", () => {
    expect(openStaffCookie(sealStaffCookie("a.b.c"))).toBe("a.b.c");
  });
});
