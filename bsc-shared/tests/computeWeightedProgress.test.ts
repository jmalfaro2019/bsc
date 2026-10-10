import { describe, expect, it } from "vitest";
import { computePerspectiveProgress, computeWeightedProgress } from "../src/index";

function perspective(
  weightage: number,
  projects: Array<{
    weightage: number;
    activities: Array<{ id: string; progress: number }>;
  }>,
) {
  return { weightage, projects };
}

describe("computeWeightedProgress", () => {
  it("returns 0 with no perspectives", () => {
    expect(computeWeightedProgress([])).toBe(0);
  });

  it("returns 0 when total perspective weight is 0", () => {
    const data = [perspective(0, [{ weightage: 100, activities: [{ id: "a", progress: 50 }] }])];
    expect(computeWeightedProgress(data)).toBe(0);
  });

  it("computes a single perspective/project/activity", () => {
    const data = [perspective(100, [{ weightage: 100, activities: [{ id: "a", progress: 50 }] }])];
    expect(computeWeightedProgress(data)).toBe(50);
  });

  it("weights perspectives by their share", () => {
    const data = [
      perspective(70, [{ weightage: 100, activities: [{ id: "a", progress: 80 }, { id: "b", progress: 60 }] }]),
      perspective(30, [{ weightage: 100, activities: [{ id: "c", progress: 40 }] }]),
    ];
    expect(computeWeightedProgress(data)).toBe(61);
  });

  it("weights projects within a perspective", () => {
    const data = [
      perspective(100, [
        { weightage: 50, activities: [{ id: "a", progress: 100 }] },
        { weightage: 50, activities: [{ id: "b", progress: 0 }] },
      ]),
    ];
    expect(computeWeightedProgress(data)).toBe(50);
  });

  it("rounds to one decimal", () => {
    const data = [
      perspective(1, [
        {
          weightage: 1,
          activities: [
            { id: "a", progress: 10 },
            { id: "b", progress: 10 },
            { id: "c", progress: 20 },
          ],
        },
      ]),
    ];
    expect(computeWeightedProgress(data)).toBe(13.3);
  });

  it("uses progressMap values when provided", () => {
    const data = [perspective(100, [{ weightage: 100, activities: [{ id: "a", progress: 90 }] }])];
    expect(computeWeightedProgress(data, new Map([["a", 30]]))).toBe(30);
  });

  it("falls back to activity progress when missing from progressMap", () => {
    const data = [perspective(100, [{ weightage: 100, activities: [{ id: "a", progress: 40 }] }])];
    expect(computeWeightedProgress(data, new Map([["other", 90]]))).toBe(40);
  });

  it("handles projects without activities", () => {
    const data = [
      perspective(100, [
        { weightage: 50, activities: [] },
        { weightage: 50, activities: [{ id: "a", progress: 80 }] },
      ]),
    ];
    expect(computeWeightedProgress(data)).toBe(40);
  });

  it("handles a perspective with no projects", () => {
    const data = [
      perspective(50, []),
      perspective(50, [{ weightage: 100, activities: [{ id: "a", progress: 100 }] }]),
    ];
    expect(computeWeightedProgress(data)).toBe(50);
  });
});

describe("computePerspectiveProgress", () => {
  it("returns 0 for a perspective with no weight", () => {
    expect(
      computePerspectiveProgress({
        projects: [{ weightage: 0, activities: [{ id: "a", progress: 80 }] }],
      }),
    ).toBe(0);
  });

  it("weights projects within the perspective", () => {
    expect(
      computePerspectiveProgress({
        projects: [
          { weightage: 25, activities: [{ id: "a", progress: 100 }] },
          { weightage: 75, activities: [{ id: "b", progress: 0 }] },
        ],
      }),
    ).toBe(25);
  });

  it("uses progressMap values when provided", () => {
    expect(
      computePerspectiveProgress(
        { projects: [{ weightage: 100, activities: [{ id: "a", progress: 90 }] }] },
        new Map([["a", 10]]),
      ),
    ).toBe(10);
  });

  it("does not round the result", () => {
    const value = computePerspectiveProgress({
      projects: [
        {
          weightage: 100,
          activities: [
            { id: "a", progress: 10 },
            { id: "b", progress: 10 },
            { id: "c", progress: 20 },
          ],
        },
      ],
    });
    expect(value).toBeCloseTo(13.333, 3);
  });
});
