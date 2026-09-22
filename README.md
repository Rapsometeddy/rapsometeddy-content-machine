# Rapsometeddy Content Machine

## Media pipeline

Telegram → Vercel → 7 scene generation → background renderer → FFmpeg → final MP4 → Telegram.

The pipeline is deliberately stage-aware. A renderer/audio failure is returned with its stage, error message, code and FFmpeg stderr where available; it is not silently converted into a generic fallback.

### Environment

- `BOT_TOKEN` — Telegram bot token.
- `POLLINATIONS_API_KEY` — optional if your Pollinations endpoint/account requires it.

### Important Vercel constraint

The current implementation uses the Node.js runtime and FFmpeg binary. Vercel functions have execution/time/resource limits, so heavy 7-image rendering may exceed the function limit. The code is structured so the renderer can be moved to a separate worker without changing the Telegram contract.

### Endpoints

- `POST /api/telegram` — Telegram webhook.
- `POST /api/render` — direct pipeline test.

Test body:
`{"prompt":"Create a cinematic Rapsometeddy AI/business short"}`

