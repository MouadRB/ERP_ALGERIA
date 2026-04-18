// Catalogue Adapter — LIVE data from catalogue.mock (shared require cache).
// Health + indexing stats come straight from catalogueEntries so rapport
// reflects the current Catalogue state.

const catalogueEntries = () => require('../../../mocks/catalogue.mock').catalogueEntries;

async function getCatalogueOverview(/* period */) {
  const entries = catalogueEntries();

  const totalDocs = entries.length;
  const indexed   = entries.filter((e) => e.openSearchIndexed).length;
  const indexedAt = entries
    .map((e) => e.openSearchIndexedAt)
    .filter(Boolean)
    .sort()
    .pop() || null;

  // Latency is an ops metric — keep a stable mocked value; everything else is live.
  const latencyMs = 42;
  const indexRate = totalDocs > 0 ? Math.round((indexed / totalDocs) * 1000) / 10 : 0;

  const openSearchHealth = {
    status:       indexed === totalDocs && totalDocs > 0 ? 'online' : 'degraded',
    docsIndexed:  indexed,
    totalDocs,
    indexRate,
    latencyMs,
    score:        Math.round(indexRate),
    lastReindex:  indexedAt,
  };

  // Lacunes (unmatched search queries) — none derivable from mock state yet.
  const lacunesOpenSearch = [];
  const totalLacunes = 0;

  return {
    openSearchHealth,
    lacunesOpenSearch,
    totalLacunes,
  };
}

module.exports = { getCatalogueOverview };
