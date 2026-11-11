// Gets one fish tank (picture + number of fish) from the Fish API.
// Ported from the module's Java starter code, with some help from AI.

const url = "https://marcconrad.com/uob/fish/api.php?out=csv&base64=yes";

export type Tank = { image: string; count: number };

// works out the picture type from the first bytes, returns null if it is not a picture
function pictureType(bytes: Buffer): string | null {
  if (bytes.length < 100) return null;
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpeg";
  if (bytes.toString("ascii", 0, 3) === "GIF") return "gif";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

async function fetchTank(): Promise<Tank> {
  // give up if the API takes longer than 5 seconds
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error("Fish API error " + res.status);

    // the reply looks like: <base64 picture>,<number of fish>
    const parts = (await res.text()).trim().split(",");
    const picture = (parts[0] ?? "").replace(/\s/g, "");
    const count = parseInt(parts[1]);
    if (!picture || isNaN(count)) throw new Error("Bad reply from Fish API");

    // check that it really is a picture before sending it on
    const type = pictureType(Buffer.from(picture, "base64"));
    if (!type) throw new Error("Fish API sent something that is not a picture");

    return { image: `data:image/${type};base64,${picture}`, count };
  } finally {
    clearTimeout(timer);
  }
}

// try up to 3 times, because the API sometimes sends a bad reply or is slow
export async function getTank(): Promise<Tank> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await fetchTank();
    } catch (error) {
      lastError = error;
      console.warn(`Fish API attempt ${attempt} failed:`, error);
    }
  }
  throw lastError;
}