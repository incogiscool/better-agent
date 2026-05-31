import { z } from "zod";
import { defineAction } from "betteragent-next";

export const searchCampaigns = defineAction({
  name: "searchCampaigns",
  description:
    "Search and filter campaigns by name or status. Returns all campaigns if no filters provided.",
  schema: z.object({
    query: z.string().optional().describe("Partial name to filter by"),
    status: z
      .enum(["live", "paused", "draft"])
      .optional()
      .describe("Filter by campaign status"),
  }),
});

export const pauseCampaign = defineAction({
  name: "pauseCampaign",
  description: "Pause a single live campaign by its ID.",
  schema: z.object({
    id: z.string().describe("Campaign ID (e.g. cmp_3a01)"),
  }),
});

export const resumeCampaign = defineAction({
  name: "resumeCampaign",
  description: "Resume a paused campaign, setting its status back to live.",
  schema: z.object({
    id: z.string().describe("Campaign ID"),
  }),
});

export const createCampaign = defineAction({
  name: "createCampaign",
  description: "Create a new draft campaign with a name.",
  schema: z.object({
    name: z.string().min(1).describe("Campaign name"),
  }),
});

export const updateCampaignBudget = defineAction({
  name: "updateCampaignBudget",
  description: "Set or update the budget (in USD) for an existing campaign.",
  schema: z.object({
    id: z.string().describe("Campaign ID"),
    budget: z.number().positive().describe("Budget in USD"),
  }),
});

export const bulkPause = defineAction({
  name: "bulkPause",
  description:
    "Pause multiple live campaigns at once. Pass an array of campaign IDs.",
  schema: z.object({
    ids: z.array(z.string()).describe("Array of campaign IDs to pause"),
  }),
});

export const searchInfluencers = defineAction({
  name: "searchInfluencers",
  description:
    "Search the influencer roster. Filter by platform, country, niche keyword, or minimum follower count. Returns all influencers if no filters provided.",
  schema: z.object({
    query: z
      .string()
      .optional()
      .describe("Partial name or handle to search for"),
    platform: z
      .enum(["instagram", "tiktok", "youtube"])
      .optional()
      .describe("Filter by platform"),
    country: z
      .string()
      .optional()
      .describe("Filter by country name (e.g. 'Canada')"),
    minFollowers: z
      .number()
      .optional()
      .describe("Minimum follower count"),
    niche: z
      .string()
      .optional()
      .describe("Niche keyword to filter by (e.g. 'running', 'fitness')"),
  }),
});

export const assignInfluencerToCampaign = defineAction({
  name: "assignInfluencerToCampaign",
  description: "Assign an influencer to a campaign by their respective IDs.",
  schema: z.object({
    influencerId: z.string().describe("Influencer ID (e.g. inf_a1b2)"),
    campaignId: z.string().describe("Campaign ID (e.g. cmp_3a01)"),
  }),
});

export const getAnalytics = defineAction({
  name: "getAnalytics",
  description:
    "Get simulated daily analytics for the last N days. Optionally filter to a single campaign.",
  schema: z.object({
    campaignId: z
      .string()
      .optional()
      .describe("Campaign ID to filter to; omit for all live campaigns"),
    days: z
      .number()
      .int()
      .min(1)
      .max(30)
      .optional()
      .describe("Number of days to look back (default 7)"),
  }),
});

export const switchTab = defineAction({
  name: "switchTab",
  description:
    "Navigate the Lumen UI to a specific tab. Use this after completing multi-step tasks so the user can see the results.",
  schema: z.object({
    tab: z
      .enum(["campaigns", "influencers", "analytics"])
      .describe("Tab to navigate to"),
  }),
});

export const actions = [
  searchCampaigns,
  pauseCampaign,
  resumeCampaign,
  createCampaign,
  updateCampaignBudget,
  bulkPause,
  searchInfluencers,
  assignInfluencerToCampaign,
  getAnalytics,
  switchTab,
];
