import { cardNames } from "./vlc";

export async function GET(request: Request) {
  return Response.json({
    cardNames: cardNames,
  });
}
