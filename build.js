#!/usr/bin/env node
// Lee companies.json y genera index.html estático.
// Uso: node build.js

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'companies.json'), 'utf8'));

const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeAttr = escapeHtml;

const slug = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const groupByRubro = (companies) => {
  const map = new Map();
  for (const c of companies) {
    if (!map.has(c.rubro)) map.set(c.rubro, []);
    map.get(c.rubro).push(c);
  }
  return map;
};

const orderedRubros = (rubrosOrder, grouped) => {
  const inOrder = rubrosOrder.filter((r) => grouped.has(r));
  const extras = [...grouped.keys()].filter((r) => !rubrosOrder.includes(r));
  return [...inOrder, ...extras];
};

const linkRel = (type) =>
  type === 'instagram' ? 'nofollow noopener external' : 'noopener external';

const linkTarget = '_blank';

const renderCard = (c) => {
  const id = `empresa-${slug(c.name)}`;
  const rel = linkRel(c.type);
  const badge = c.featured
    ? `<span class="badge badge-featured" aria-label="Destacado">★ Destacado</span>`
    : '';
  const typeChip =
    c.type === 'instagram'
      ? `<span class="chip chip-instagram" title="Solo presencia en Instagram">Instagram</span>`
      : '';

  return `
        <article class="company-card${c.featured ? ' is-featured' : ''}" id="${escapeAttr(id)}">
          <header class="company-card__header">
            <h3 class="company-card__name">${escapeHtml(c.name)}</h3>
            <p class="company-card__subrubro">${escapeHtml(c.subrubro)}</p>
            <div class="company-card__badges">${badge}${typeChip}</div>
          </header>
          <p class="company-card__description">${escapeHtml(c.description)}</p>
          <p class="company-card__cta">
            Conocé más sobre
            <a class="company-card__link" href="${escapeAttr(c.url)}" rel="${rel}" target="${linkTarget}">${escapeHtml(c.keyword)}</a>
            <span aria-hidden="true" class="arrow">→</span>
          </p>
        </article>`;
};

const renderRubroSection = (rubro, companies) => {
  const rubroSlug = slug(rubro);
  const count = companies.length;
  return `
      <section class="rubro" id="${escapeAttr(rubroSlug)}" aria-labelledby="rubro-${escapeAttr(rubroSlug)}-title">
        <header class="rubro__header">
          <h2 id="rubro-${escapeAttr(rubroSlug)}-title" class="rubro__title">${escapeHtml(rubro)}</h2>
          <p class="rubro__count">${count} ${count === 1 ? 'empresa' : 'empresas'}</p>
        </header>
        <div class="cards-grid">${companies.map(renderCard).join('')}
        </div>
      </section>`;
};

const renderNav = (rubros) => {
  const items = rubros
    .map((r) => `<li><a href="#${escapeAttr(slug(r))}">${escapeHtml(r)}</a></li>`)
    .join('');
  return `
    <nav class="rubros-nav" aria-label="Rubros disponibles">
      <div class="container">
        <ul>${items}</ul>
      </div>
    </nav>`;
};

const renderJsonLd = (site, companies) => {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: site.title,
    description: site.description,
    inLanguage: site.locale,
    numberOfItems: companies.length,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: companies.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'LocalBusiness',
        name: c.name,
        url: c.url,
        description: c.description,
        areaServed: {
          '@type': 'AdministrativeArea',
          name: 'Mendoza, Argentina',
        },
        knowsAbout: c.keyword,
      },
    })),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: site.url,
      },
    ],
  };

  return `
  <script type="application/ld+json">
${JSON.stringify(itemList, null, 2)}
  </script>
  <script type="application/ld+json">
${JSON.stringify(breadcrumb, null, 2)}
  </script>`;
};

const renderHtml = (data) => {
  const { site, rubros_order, companies } = data;
  const grouped = groupByRubro(companies);
  const rubros = orderedRubros(rubros_order, grouped);
  const totalCompanies = companies.length;
  const totalRubros = rubros.length;

  return `<!DOCTYPE html>
<html lang="${escapeAttr(site.locale)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(site.title)}</title>
  <meta name="description" content="${escapeAttr(site.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <meta name="author" content="${escapeAttr(site.region)}">
  <link rel="canonical" href="${escapeAttr(site.url)}">

  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeAttr(site.title)}">
  <meta property="og:description" content="${escapeAttr(site.description)}">
  <meta property="og:url" content="${escapeAttr(site.url)}">
  <meta property="og:locale" content="es_AR">
  <meta property="og:site_name" content="${escapeAttr(site.title)}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttr(site.title)}">
  <meta name="twitter:description" content="${escapeAttr(site.description)}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
${renderJsonLd(site, companies)}
</head>
<body>
  <a class="skip-link" href="#main">Saltar al contenido</a>

  <header class="site-header">
    <div class="container">
      <p class="site-header__eyebrow">Guía local · ${escapeHtml(site.region)}</p>
      <h1 class="site-header__title">${escapeHtml(site.title)}</h1>
      <p class="site-header__lead">${escapeHtml(site.tagline)}</p>
      <p class="site-header__meta">
        <strong>${totalCompanies}</strong> empresas curadas en
        <strong>${totalRubros}</strong> rubros · Actualizado en ${site.year}
      </p>
    </div>
  </header>
${renderNav(rubros)}
  <main id="main" class="container">
    <section class="intro">
      <p>
        Mendoza es una de las regiones más activas de Argentina para el turismo,
        el vino, la industria y el desarrollo de empresas. En esta página
        recopilamos servicios útiles y empresas locales recomendadas para
        visitantes, residentes y compañías que operan en la provincia.
      </p>
      <p>
        Cada empresa incluye una descripción breve y un enlace directo al sitio
        oficial. Si querés sumar tu empresa, escribinos a la dirección del pie de página.
      </p>
    </section>
${rubros.map((r) => renderRubroSection(r, grouped.get(r))).join('')}
  </main>

  <footer class="site-footer">
    <div class="container">
      <p>Actualizado en ${site.year}. Guía elaborada en ${escapeHtml(site.region)}.</p>
      <p class="site-footer__small">
        ¿Tenés una empresa en Mendoza y querés aparecer en esta guía? Sumate escribiéndonos.
      </p>
    </div>
  </footer>
</body>
</html>
`;
};

const renderSitemap = (site) => {
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeAttr(site.url)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
};

const renderRobots = (site) => {
  const sitemapUrl = site.url.replace(/\/$/, '') + '/sitemap.xml';
  return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;
};

const html = renderHtml(DATA);
fs.writeFileSync(path.join(ROOT, 'index.html'), html, 'utf8');

const sitemap = renderSitemap(DATA.site);
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');

const robots = renderRobots(DATA.site);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots, 'utf8');

console.log(
  `✓ index.html + sitemap.xml + robots.txt generados (${DATA.companies.length} empresas, ${
    new Set(DATA.companies.map((c) => c.rubro)).size
  } rubros).`,
);
