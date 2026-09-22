import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request, { params }) {
  const ticker = String(params?.ticker || "AAPL").toUpperCase().replace(/[^A-Z.]/g, "");
  if (!ticker) return NextResponse.json({ error: "Invalid ticker" }, { status: 400 });

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1d&interval=1m&includePrePost=true`;
    const response = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 RapsometeddyContentMachine/1.0" }
    });
    if (!response.ok) throw new Error(`Upstream market data error: ${response.status}`);

    const json = await response.json();
    const result = json?.chart?.result?.[0];
    const meta = result?.meta;
    if (!meta?.regularMarketPrice) throw new Error("No market price returned");

    const price = Number(meta.regularMarketPrice);
    const previousClose = Number(meta.previousClose ?? meta.chartPreviousClose ?? price);
    const change = price - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

    return NextResponse.json({
      ticker,
      price,
      previousClose,
      change,
      changePercent,
      currency: meta.currency || "USD",
      exchange: meta.fullExchangeName || meta.exchangeName || "NASDAQ",
      marketState: meta.marketState || "UNKNOWN",
      asOf: new Date().toISOString(),
      source: "Yahoo Finance chart endpoint"
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (error) {
    return NextResponse.json({
      error: "Market data unavailable",
      detail: error instanceof Error ? error.message : "Unknown error"
    }, { status: 502 });
  }
}
