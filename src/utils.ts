export const split = (buffer: Buffer, len: number): [Buffer, Buffer] => {
  const left = buffer.slice(0, len);
  const right = buffer.slice(len, buffer.length);
  return [left, right];
};

/**
 *
 * @param buffer The buffer which should be chunked
 * @param chunkLengths array with chunk lengths
 */
export function chunk(buffer: Buffer | Uint8Array, chunkLength: number) {
  let chunks = [];
  let currIndex = 0;
  while (currIndex < buffer.length) {
    const chunk = buffer.slice(currIndex, currIndex + chunkLength);
    currIndex += chunkLength;
    chunks.push(chunk);
  }
  return chunks;
}


export type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};

export type FilterKeys<Base, Condition> = FilterFlags<
  Base,
  Condition
>[keyof Base];
