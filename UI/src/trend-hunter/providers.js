import { enrichTrend, mockTrends, trendPlatforms } from "./trendHunterData";

export class TrendProvider {
  constructor(name, platform) {
    this.name = name;
    this.platform = platform;
  }

  async discover() {
    throw new Error("Trend providers must implement discover().");
  }
}

class MockTrendProvider extends TrendProvider {
  async discover(filters = {}) {
    await new Promise((resolve) => setTimeout(resolve, 80));

    return mockTrends
      .filter((trend) => trend.platform === this.platform || trend.suggestedPlatforms.includes(this.platform))
      .filter((trend) => matchesFilters(trend, filters))
      .map((trend) => enrichTrend({ ...trend, sourceProvider: this.name }));
  }
}

export const trendProviders = trendPlatforms.map((platform) => new MockTrendProvider(`${platform} Mock Provider`, platform));

export async function discoverTrends(filters = {}, providers = trendProviders) {
  const activeProviders = providers.filter((provider) => filters.platform === "All Platforms" || provider.platform === filters.platform);
  const results = await Promise.all(activeProviders.map((provider) => provider.discover(filters)));
  const deduped = new Map();

  results.flat().forEach((trend) => {
    const existing = deduped.get(trend.id);
    if (!existing || trend.score > existing.score) {
      deduped.set(trend.id, trend);
    }
  });

  return [...deduped.values()].sort((a, b) => b.score - a.score);
}

function matchesFilters(trend, filters) {
  return [
    ["country", trend.country],
    ["state", trend.state],
    ["city", trend.city],
    ["industry", trend.industry],
  ].every(([key, value]) => !filters[key] || filters[key].startsWith("All ") || value === filters[key]);
}
