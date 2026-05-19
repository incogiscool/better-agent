"use server";

import { z } from "zod";
import { defineServerAction } from "@betteragent/next";
import { CAMPAIGNS, type Campaign } from "../_data/campaigns";

// In-memory mutable state — demo only, resets on cold start.
const state: { campaigns: Campaign[] } = {
  campaigns: [...CAMPAIGNS],
};

export const searchCampaigns = defineServerAction({
  name: "searchCampaigns",
  description:
    "Search or filter campaigns. Returns all if query is empty. Supports filtering by status.",
  schema: z.object({
    query: z.string().optional(),
    status: z.enum(["live", "draft", "paused"]).optional(),
  }),
  async handler({ query, status }) {
    let results = state.campaigns;
    if (status) results = results.filter((c) => c.status === status);
    if (query) {
      const q = query.toLowerCase();
      results = results.filter((c) => c.name.toLowerCase().includes(q));
    }
    return {
      campaigns: results.map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        reach: c.reach,
        engagement: `${(c.engagement * 100).toFixed(1)}%`,
        cpm: `$${c.cpm.toFixed(2)}`,
      })),
      total: results.length,
    };
  },
});

export const pauseCampaign = defineServerAction({
  name: "pauseCampaign",
  description: "Pause a live campaign by its ID. Returns the updated campaign.",
  schema: z.object({ id: z.string().min(1) }),
  async handler({ id }) {
    const idx = state.campaigns.findIndex((c) => c.id === id);
    if (idx === -1) {
      return { ok: false, error: `Campaign ${id} not found.` };
    }
    const campaign = state.campaigns[idx]!;
    if (campaign.status !== "live") {
      return { ok: false, error: `Campaign ${id} is not live.` };
    }
    state.campaigns[idx] = { ...campaign, status: "paused" };
    return { ok: true, campaign: state.campaigns[idx] };
  },
});

export const createCampaign = defineServerAction({
  name: "createCampaign",
  description: "Create a new draft campaign with a name.",
  schema: z.object({ name: z.string().min(1).max(80) }),
  async handler({ name }) {
    const id = `cmp_${Math.random().toString(36).slice(2, 6)}`;
    const campaign: Campaign = {
      id,
      name,
      reach: 0,
      spend: 0,
      cpm: 0,
      engagement: 0,
      status: "draft",
    };
    state.campaigns.push(campaign);
    return { ok: true, campaign };
  },
});
