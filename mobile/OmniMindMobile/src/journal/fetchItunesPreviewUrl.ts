/**
 * Apple iTunes Search API — ücretsiz, anahtarsız. Çoğu parça için kısa önizleme URL’si döner.
 * @see https://performance-partners.apple.com/search-api
 */
export async function fetchItunesPreviewUrl(
  searchTerm: string
): Promise<string | null> {
  const trimmed = searchTerm.trim();
  if (!trimmed) return null;

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&media=music&entity=song&limit=1&country=tr`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as { results?: { previewUrl?: string }[] };
    const p = json.results?.[0]?.previewUrl;
    return typeof p === "string" && p.length > 0 ? p : null;
  } catch {
    return null;
  }
}
