export function indexOfSubBuffer(
  source: Uint8Array,
  search: Uint8Array
): number {
  let run = true;
  let start = 0;

  while (run) {
    const idx = source.indexOf(search[0], start);

    // not found
    if (idx < start) {
      run = false;
      continue;
    }

    // Make sure the rest of the subarray contains the search pattern
    const subBuff = source.subarray(idx, idx + search.length);

    let retry = false;
    let i = 1;
    for (; i < search.length && !retry; ++i) {
      if (subBuff[i] !== search[i]) {
        retry = true;
      }
    }

    if (retry) {
      start = idx + i;
      continue;
    } else {
      return idx;
    }
  }

  return -1;
}
