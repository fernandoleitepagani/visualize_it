/** Splits a code block template literal into trimmed lines. */
export function lines(block: string): string[] {
  return block.trim().split('\n');
}
