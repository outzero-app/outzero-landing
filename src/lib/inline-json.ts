/**
 * Serialises data for embedding inside a `<script type="application/json">`
 * block.
 *
 * `JSON.stringify` leaves `<` untouched, so a spot name containing `</script>`
 * would close the tag early and break the rest of the page. Escaping every `<`
 * as `<` keeps the JSON valid while making that impossible.
 */
export function inlineJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
