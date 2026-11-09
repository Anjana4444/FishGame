// Gets one fish tank (picture + number of fish) from the Fish API.
// Ported from the module's Java starter code, with some help from AI.

const url = "https://marcconrad.com/uob/fish/api.php?out=csv&base64=yes";

export type Tank = { image: string; count: number };

export async function getTank(): Promise<Tank> {
  // give up if the API takes longer than 5 seconds
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error("Fish API error " + res.status);

    // the reply looks like: <base64 picture>,<number of fish>
    const parts = (await res.text()).trim().split(",");
    const count = parseInt(parts[1]);
    if (!parts[0] || isNaN(count)) throw new Error("Bad reply from Fish API");

    const type = parts[0].startsWith("iVBOR") ? "png" : "jpeg";
    return { image: `data:image/${type};base64,${parts[0]}`, count };
  } finally {
    clearTimeout(timer);
  }
}