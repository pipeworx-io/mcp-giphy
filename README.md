# mcp-giphy

Giphy MCP — wraps Giphy API (public beta key, free)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_gifs` | Search Giphy for GIFs by keyword. Returns title, URL, rating, and multiple image sizes. |
| `trending_gifs` | Get currently trending GIFs on Giphy. Returns title, URL, rating, and multiple image sizes. |
| `random_gif` | Get a random GIF, optionally filtered by tag (e.g., "cats"). Returns title, URL, rating, and image URLs. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "giphy": {
      "url": "https://gateway.pipeworx.io/giphy/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Giphy data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
