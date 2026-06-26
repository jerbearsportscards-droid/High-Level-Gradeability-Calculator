import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();

    // Pass 1 — identify every detail visible on the card
    const identifyMsg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
          { type: "text", text: `Look at this sports card image very carefully. Read and report EXACTLY what you see printed on the card.

Return JSON only:
{
  "player": "<exact name printed on card>",
  "year": "<year on card or rookie year if RC>",
  "brand": "<brand printed — Panini, Topps, Donruss, Upper Deck, etc.>",
  "set": "<set name printed — Prizm, Optic, Bowman, Select, Mosaic, Rookies & Stars, etc.>",
  "cardNumber": "<card number if visible, e.g. #21 or #SG-16>",
  "parallel": "<CRITICAL — look at border color, foil finish, background pattern. Is it: Base, Silver/Holo, Gold, Orange, Red, Blue, Green, Pink, Disco, Cracked Ice, Mosaic, Hyper, Neon, Scope, Fast Break, or other? Name it exactly>",
  "isAuto": <true if you see handwritten ink signature on card, false if not>,
  "serialNumber": "<if there is a printed fraction like 004/149 or /99, write it exactly. Otherwise null>",
  "sport": "<Football, Basketball, Baseball, or other>",
  "isRookie": <true if RC or Rookie Card label visible>
}` }
        ]
      }]
    });

    const idText = identifyMsg.content[0].type === "text" ? identifyMsg.content[0].text : "{}";
    const idJson = JSON.parse(idText.match(/\{[\s\S]*\}/)![0]);

    const cardDesc = [
      idJson.year,
      idJson.brand,
      idJson.set,
      idJson.player,
      idJson.cardNumber,
      idJson.isRookie ? "RC" : "",
      idJson.parallel !== "Base" ? idJson.parallel : "",
      idJson.isAuto ? "Auto" : "",
      idJson.serialNumber ? `/${idJson.serialNumber.split("/")[1]}` : "",
    ].filter(Boolean).join(" ");

    // Pass 2 — price & grade estimates based on the identified card
    const priceMsg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: `You are a sports card market expert. Based on your knowledge, estimate current market values for this specific card:

CARD: ${cardDesc}
Auto: ${idJson.isAuto}
Serial: ${idJson.serialNumber ?? "none"}
Parallel: ${idJson.parallel}

Key pricing rules:
- Autos are worth 3-10x non-auto versions
- Serials under /25 are worth 5-20x base
- Holo/Silver prizm parallels worth 2-5x base
- Gold /10 worth 10-30x base
- Orange /49 or /99 worth 2-4x base
- Disco and specialty parallels worth 2-8x base
- PSA 10 typically 2-4x raw for rookies
- Gem rates: autos grade harder (20-35%), base cards (35-55%), holo/prizm (30-50%)

Return JSON only:
{
  "cardName": "${cardDesc}",
  "rawCost": <current raw market value $, integer>,
  "psa10Value": <PSA 10 value $, integer>,
  "psa9Value": <PSA 9 value $, integer>,
  "psa8Value": <PSA 8 value $, integer>,
  "gemRate": <% chance PSA 10, integer>,
  "nineRate": <% chance PSA 9, integer>,
  "eightRate": <% chance PSA 8, integer>,
  "popTotal": <estimated PSA 10 pop count, integer>,
  "athleteDemand": <1-10 hype score, integer>,
  "cardLiquidity": <1-10 ease of selling, integer>,
  "gradingFee": 25,
  "confidence": "<low|medium|high — how confident are you in these prices>"
}`
        }]
      }]
    });

    const priceText = priceMsg.content[0].type === "text" ? priceMsg.content[0].text : "{}";
    const priceJson = JSON.parse(priceText.match(/\{[\s\S]*\}/)![0]);

    return NextResponse.json({ ...idJson, ...priceJson, cardName: cardDesc });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to analyze card" }, { status: 500 });
  }
}
