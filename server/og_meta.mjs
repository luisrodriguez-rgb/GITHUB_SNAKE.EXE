const DEMO = 'https://luisrodriguez-rgb.github.io/GITHUB_SNAKE.EXE/';

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

export function shareCopy(username, lang) {
  const user = String(username).replace(/[^A-Za-z0-9-]/g, '') || 'torvalds';
  if (lang === 'en') {
    return {
      title: `@${user} — the graph is the level`,
      description: `A snake is already eating @${user}'s GitHub contribution graph.`
    };
  }
  return {
    title: `@${user} — el grafico es el nivel`,
    description: `Una serpiente ya se esta comiendo el grafico de @${user}.`
  };
}

export function pageUrlFor(requestUrl, username, lang) {
  const url = new URL(requestUrl);
  const host = url.hostname;
  let base = '';
  if (host.endsWith('github.io')) {
    const repo = url.pathname.split('/').filter(Boolean)[0];
    if (repo && repo !== 'og') base = `/${repo}`;
  }
  const page = new URL(base ? `${base}/` : '/', url.origin);
  page.searchParams.set('user', username);
  if (lang === 'en') page.searchParams.set('lang', 'en');
  return page.toString();
}

export function imageUrlFor(requestUrl, username) {
  const page = new URL(pageUrlFor(requestUrl, username));
  const path = page.pathname.replace(/\/$/, '');
  page.pathname = `${path}/og/${encodeURIComponent(username)}.png`;
  page.search = '';
  return page.toString();
}

function upsertMeta(html, attr, key, content) {
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}">`;
  const re = new RegExp(`<meta\\s+${attr}=["']${key}["']\\s+content=["'][^"']*["']\\s*/?>`, 'i');
  if (re.test(html)) return html.replace(re, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
}

export function injectOg(html, username, requestUrl) {
  const url = new URL(requestUrl);
  const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'es';
  const copy = shareCopy(username, lang);
  const page = pageUrlFor(requestUrl, username, lang);
  const image = imageUrlFor(requestUrl, username);
  let next = html;
  next = upsertMeta(next, 'property', 'og:title', copy.title);
  next = upsertMeta(next, 'property', 'og:description', copy.description);
  next = upsertMeta(next, 'property', 'og:image', image);
  next = upsertMeta(next, 'property', 'og:url', page);
  next = upsertMeta(next, 'name', 'twitter:title', copy.title);
  next = upsertMeta(next, 'name', 'twitter:description', copy.description);
  next = upsertMeta(next, 'name', 'twitter:image', image);
  next = upsertMeta(next, 'name', 'description', copy.description);
  const titleRe = /<title>[^<]*<\/title>/i;
  if (titleRe.test(next)) next = next.replace(titleRe, `<title>${escapeAttr(copy.title)}</title>`);
  return next;
}

export function safeUser(value) {
  const user = String(value || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  return user.length > 0 && user.length <= 39 ? user : null;
}

export { DEMO };
