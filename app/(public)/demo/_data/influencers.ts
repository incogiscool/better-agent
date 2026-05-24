export type Influencer = {
  id: string;
  name: string;
  handle: string;
  platform: "instagram" | "tiktok" | "youtube";
  followers: number;
  engagementRate: number;
  country: string;
  niche: string[];
  assignedCampaignIds: string[];
};

export const INFLUENCERS: Influencer[] = [
  {
    id: "inf_a1b2",
    name: "Zara Kinsley",
    handle: "@zarakinsley",
    platform: "instagram",
    followers: 1_200_000,
    engagementRate: 0.038,
    country: "Canada",
    niche: ["running", "fitness"],
    assignedCampaignIds: [],
  },
  {
    id: "inf_c3d4",
    name: "Milo Vance",
    handle: "@milovance",
    platform: "tiktok",
    followers: 890_000,
    engagementRate: 0.052,
    country: "Canada",
    niche: ["running", "outdoor"],
    assignedCampaignIds: [],
  },
  {
    id: "inf_e5f6",
    name: "Petra Halloway",
    handle: "@petrahalloway",
    platform: "youtube",
    followers: 2_100_000,
    engagementRate: 0.028,
    country: "Canada",
    niche: ["fitness", "lifestyle"],
    assignedCampaignIds: [],
  },
  {
    id: "inf_g7h8",
    name: "Caden Wyre",
    handle: "@cadenwyre",
    platform: "instagram",
    followers: 450_000,
    engagementRate: 0.061,
    country: "US",
    niche: ["running", "wellness"],
    assignedCampaignIds: [],
  },
  {
    id: "inf_i9j0",
    name: "Nola Ferrex",
    handle: "@nolaferrex",
    platform: "instagram",
    followers: 780_000,
    engagementRate: 0.043,
    country: "UK",
    niche: ["fashion", "lifestyle"],
    assignedCampaignIds: [],
  },
  {
    id: "inf_k1l2",
    name: "Dex Arlow",
    handle: "@dexarlow",
    platform: "youtube",
    followers: 1_050_000,
    engagementRate: 0.031,
    country: "Germany",
    niche: ["tech", "fitness"],
    assignedCampaignIds: [],
  },
  {
    id: "inf_m3n4",
    name: "Sable Crew",
    handle: "@sablecrew",
    platform: "tiktok",
    followers: 620_000,
    engagementRate: 0.071,
    country: "Australia",
    niche: ["running", "outdoor", "fitness"],
    assignedCampaignIds: [],
  },
  {
    id: "inf_o5p6",
    name: "Remy Stax",
    handle: "@remystax",
    platform: "instagram",
    followers: 95_000,
    engagementRate: 0.082,
    country: "US",
    niche: ["running", "wellness"],
    assignedCampaignIds: [],
  },
];
