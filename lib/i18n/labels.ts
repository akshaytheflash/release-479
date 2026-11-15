import type { MessageKey } from "./messages/en";

/**
 * Display labels for the BNS reference data. Section numbers, ids and the
 * citation notes in lib/bns.ts stay verbatim; only the offence name and the
 * maximum-sentence wording are translated.
 */
export const BNS_TITLE_KEYS: Record<string, MessageKey> = {
  bns115: "bns.bns115.title",
  bns329_house: "bns.bns329_house.title",
  bns351_simple: "bns.bns351_simple.title",
  bns303: "bns.bns303.title",
  bns318_simple: "bns.bns318_simple.title",
  bns316: "bns.bns316.title",
  bns117: "bns.bns117.title",
  bns351_agg: "bns.bns351_agg.title",
  bns318_delivery: "bns.bns318_delivery.title",
  bns309: "bns.bns309.title",
  bns109: "bns.bns109.title",
};

export const BNS_MAX_KEYS: Record<string, MessageKey> = {
  bns115: "bns.max.1",
  bns329_house: "bns.max.1",
  bns351_simple: "bns.max.2",
  bns303: "bns.max.3",
  bns318_simple: "bns.max.3",
  bns316: "bns.max.5",
  bns117: "bns.max.7",
  bns351_agg: "bns.max.7",
  bns318_delivery: "bns.max.7",
  bns309: "bns.max.10",
  bns109: "bns.max.10life",
};

export function bnsTitleKey(id: string): MessageKey | null {
  return BNS_TITLE_KEYS[id] ?? null;
}

export function bnsMaxKey(id: string): MessageKey | null {
  return BNS_MAX_KEYS[id] ?? null;
}
