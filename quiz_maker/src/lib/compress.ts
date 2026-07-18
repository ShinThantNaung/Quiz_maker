// Client-side compression for serialized quiz payloads.
//
// Published quizzes are serialized to JSON and gzipped before being written to
// localStorage, keeping larger quizzes well inside the ~5MB budget. Compression
// uses the built-in CompressionStream API (no dependencies). When it isn't
// available the payload is stored as plain base64 and the `compressed` flag on
// the record records which path was taken, so decoding always round-trips.

/** Result of encoding a string: base64 text plus whether it was gzipped. */
export interface Encoded {
  payload: string;
  compressed: boolean;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const CHUNK = 0x8000; // avoid "too many arguments" on String.fromCharCode.
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

/** Push `data` through a (de)compression stream and collect the result bytes. */
async function pipe(
  data: Uint8Array<ArrayBuffer>,
  stream: CompressionStream | DecompressionStream,
): Promise<Uint8Array> {
  const writer = stream.writable.getWriter();
  // Fire-and-forget: the reader below drains what these produce.
  void writer.write(data);
  void writer.close();

  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return concat(chunks);
}

/** Serialize + (optionally) gzip a string into base64-safe storage text. */
export async function encode(text: string): Promise<Encoded> {
  // Copy into a fresh ArrayBuffer-backed view (encode() may be SharedArrayBuffer-typed).
  const input = new Uint8Array(new TextEncoder().encode(text));
  if (typeof CompressionStream === "undefined") {
    return { payload: bytesToBase64(input), compressed: false };
  }
  const gzipped = await pipe(input, new CompressionStream("gzip"));
  return { payload: bytesToBase64(gzipped), compressed: true };
}

/** Reverse `encode`, returning the original string. */
export async function decode({ payload, compressed }: Encoded): Promise<string> {
  const bytes = base64ToBytes(payload);
  if (!compressed || typeof DecompressionStream === "undefined") {
    return new TextDecoder().decode(bytes);
  }
  const raw = await pipe(bytes, new DecompressionStream("gzip"));
  return new TextDecoder().decode(raw);
}
