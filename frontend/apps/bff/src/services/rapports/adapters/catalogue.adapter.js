// Catalogue / OpenSearch Adapter — MOCK (static data)
// TODO: Replace with real API call when Catalogue module is merged

const env = require('../../../config/env');

async function getCatalogueOverview(/* period */) {
  // if (!env.useMock) { return await fetch(...) }

  return {
    openSearchHealth: {
      status:        'online',
      docsIndexed:   487,
      totalDocs:     524,
      indexRate:      92.9,
      latencyMs:     42,
      score:         94,
      lastReindex:   '2025-03-25T03:00:00.000Z',
    },

    lacunesOpenSearch: [
      { query: 'casque gamer',           count: 34, hasProduct: false },
      { query: 'montre connectée',       count: 28, hasProduct: false },
      { query: 'sac à dos étanche',      count: 22, hasProduct: true  },
      { query: 'clavier arabe',          count: 19, hasProduct: false },
      { query: 'protection écran iphone', count: 17, hasProduct: true  },
      { query: 'chaussures running 44',  count: 15, hasProduct: true  },
      { query: 'tablette dessin',        count: 12, hasProduct: false },
    ],
    totalLacunes: 23,
  };
}

module.exports = { getCatalogueOverview };
