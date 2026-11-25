const pick = (...values: Array<string | undefined>) =>
  values.find((v) => typeof v === 'string' && v.trim().length > 0);

function requireUrl(name: string, value: string | undefined, schemes: string[]) {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!v) {
    throw new Error(
      `[Tapbite] Missing required config: ${name}. Set it in .env.local (see .env.example).`
    );
  }
  if (!schemes.some((s) => v.startsWith(s))) {
    throw new Error(
      `[Tapbite] ${name} must start with ${schemes.join(' or ')}. Got: ${v}`
    );
  }
  return v;
}

const normalize = (url: string, isWs: boolean) => {
  let u = url.replace(/\/graphql\/?$/, '/');
  if (!u.endsWith('/')) u += '/';
  if (isWs && u.startsWith('https://')) u = 'wss://' + u.slice('https://'.length);
  if (isWs && u.startsWith('http://')) u = 'ws://' + u.slice('http://'.length);
  return u;
};

const resolveBackend = () => {
  const http = requireUrl(
    'GRAPHQL_URL (or NEXT_PUBLIC_GRAPHQL_URL / NEXT_PUBLIC_SERVER_URL)',
    pick(
      process.env.GRAPHQL_URL,
      process.env.NEXT_PUBLIC_GRAPHQL_URL,
      process.env.NEXT_PUBLIC_SERVER_URL
    ),
    ['https://', 'http://']
  );
  const ws = requireUrl(
    'WS_GRAPHQL_URL (or NEXT_PUBLIC_WS_GRAPHQL_URL / NEXT_PUBLIC_WS_SERVER_URL)',
    pick(
      process.env.WS_GRAPHQL_URL,
      process.env.NEXT_PUBLIC_WS_GRAPHQL_URL,
      process.env.NEXT_PUBLIC_WS_SERVER_URL
    ),
    ['wss://', 'ws://', 'https://', 'http://']
  );
  return {
    SERVER_URL: normalize(http, false),
    WS_SERVER_URL: normalize(ws, true),
  };
};

const resolved = resolveBackend();

export const BACKEND_URL = {
  LOCAL: resolved,
  LIVE: resolved,
};
