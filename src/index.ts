interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Giphy MCP — wraps Giphy API (public beta key, free)
 *
 * Tools:
 * - search_gifs: Search GIFs by keyword
 * - trending_gifs: Get currently trending GIFs
 * - random_gif: Get a single random GIF, optionally filtered by tag
 */


const BASE_URL = 'https://api.giphy.com/v1/gifs';
const API_KEY = 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65';

// ── API types ─────────────────────────────────────────────────────────

type GiphyImage = {
  url: string;
  width: string;
  height: string;
};

type GiphyImages = {
  original: GiphyImage;
  fixed_height: GiphyImage;
  downsized: GiphyImage & { size: string };
};

type GiphyGif = {
  id: string;
  title: string;
  slug: string;
  url: string;
  rating: string;
  import_datetime: string;
  images: GiphyImages;
};

type GiphyListResponse = {
  data: GiphyGif[];
  pagination: { total_count: number; count: number; offset: number };
  meta: { status: number; msg: string };
};

type GiphyRandomResponse = {
  data: GiphyGif;
  meta: { status: number; msg: string };
};

// ── Tool definitions ──────────────────────────────────────────────────

const tools: McpToolExport['tools'] = [
  {
    name: 'search_gifs',
    description:
      'Search Giphy for GIFs matching a keyword or phrase. Returns GIF title, URL, rating, and image URLs in original and fixed-height sizes.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query, e.g. "funny cats" or "celebration"',
        },
        limit: {
          type: 'number',
          description: 'Number of results to return (1–25, default 10)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'trending_gifs',
    description:
      'Get the currently trending GIFs on Giphy. Returns title, URL, rating, and image URLs.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of results to return (1–25, default 10)',
        },
      },
      required: [],
    },
  },
  {
    name: 'random_gif',
    description:
      'Get a single random GIF from Giphy, optionally filtered by a tag. Returns title, URL, rating, and image URLs.',
    inputSchema: {
      type: 'object',
      properties: {
        tag: {
          type: 'string',
          description: 'Optional tag to filter by, e.g. "dogs" or "anime"',
        },
      },
      required: [],
    },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────

function formatGif(gif: GiphyGif) {
  return {
    id: gif.id,
    title: gif.title,
    url: gif.url,
    rating: gif.rating,
    gif_url: gif.images.original.url,
    fixed_height_url: gif.images.fixed_height.url,
    downsized_url: gif.images.downsized.url,
    width: parseInt(gif.images.original.width, 10),
    height: parseInt(gif.images.original.height, 10),
  };
}

// ── Tool implementations ──────────────────────────────────────────────

async function searchGifs(query: string, limit = 10) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    q: query,
    limit: String(Math.min(Math.max(limit, 1), 25)),
  });
  const res = await fetch(`${BASE_URL}/search?${params}`);
  if (!res.ok) throw new Error(`Giphy API error: ${res.status}`);

  const data = (await res.json()) as GiphyListResponse;
  if (data.meta.status !== 200) throw new Error(`Giphy API error: ${data.meta.msg}`);

  return {
    total: data.pagination.total_count,
    count: data.pagination.count,
    gifs: data.data.map(formatGif),
  };
}

async function trendingGifs(limit = 10) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    limit: String(Math.min(Math.max(limit, 1), 25)),
  });
  const res = await fetch(`${BASE_URL}/trending?${params}`);
  if (!res.ok) throw new Error(`Giphy API error: ${res.status}`);

  const data = (await res.json()) as GiphyListResponse;
  if (data.meta.status !== 200) throw new Error(`Giphy API error: ${data.meta.msg}`);

  return {
    count: data.pagination.count,
    gifs: data.data.map(formatGif),
  };
}

async function randomGif(tag?: string) {
  const params = new URLSearchParams({ api_key: API_KEY });
  if (tag) params.set('tag', tag);

  const res = await fetch(`${BASE_URL}/random?${params}`);
  if (!res.ok) throw new Error(`Giphy API error: ${res.status}`);

  const data = (await res.json()) as GiphyRandomResponse;
  if (data.meta.status !== 200) throw new Error(`Giphy API error: ${data.meta.msg}`);

  return formatGif(data.data);
}

// ── Dispatcher ────────────────────────────────────────────────────────

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_gifs':
      return searchGifs(args.query as string, args.limit as number | undefined);
    case 'trending_gifs':
      return trendingGifs(args.limit as number | undefined);
    case 'random_gif':
      return randomGif(args.tag as string | undefined);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
