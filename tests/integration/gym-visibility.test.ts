import { describe, expect, it } from "vitest";
import { canPreviewUnpublishedGym } from "@/lib/gym-visibility";

describe("canPreviewUnpublishedGym", () => {
  it("allows owner/admin/staff from the same gym", () => {
    expect(
      canPreviewUnpublishedGym("gym-1", { role: "owner", gymId: "gym-1" }),
    ).toBe(true);
    expect(
      canPreviewUnpublishedGym("gym-1", { role: "admin", gymId: "gym-1" }),
    ).toBe(true);
    expect(
      canPreviewUnpublishedGym("gym-1", { role: "staff", gymId: "gym-1" }),
    ).toBe(true);
  });

  it("denies members and unaffiliated accounts", () => {
    expect(
      canPreviewUnpublishedGym("gym-1", { role: "member", gymId: "gym-1" }),
    ).toBe(false);
    expect(
      canPreviewUnpublishedGym("gym-1", { role: "admin", gymId: "gym-2" }),
    ).toBe(false);
    expect(canPreviewUnpublishedGym("gym-1", null)).toBe(false);
  });
});
