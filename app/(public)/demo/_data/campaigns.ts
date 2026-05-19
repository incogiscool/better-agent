export type Campaign = {
  id: string;
  name: string;
  reach: number;
  spend: number;
  cpm: number;
  engagement: number;
  status: "live" | "draft" | "paused";
};

export const CAMPAIGNS: Campaign[] = [
  {
    id: "cmp_3a01",
    name: "Spring Wool Refresh",
    reach: 1_400_000,
    spend: 9_200,
    cpm: 6.57,
    engagement: 0.014,
    status: "live",
  },
  {
    id: "cmp_2f1c",
    name: "Tech Tee Restock",
    reach: 640_000,
    spend: 4_992,
    cpm: 7.8,
    engagement: 0.021,
    status: "live",
  },
  {
    id: "cmp_29d4",
    name: "Pocket Tee Slate",
    reach: 210_000,
    spend: 1_344,
    cpm: 6.4,
    engagement: 0.009,
    status: "draft",
  },
];
