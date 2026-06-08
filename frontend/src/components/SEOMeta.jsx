import { Helmet } from 'react-helmet-async';

const CANONICAL_BASE =
  import.meta.env.VITE_CANONICAL_BASE_URL || 'https://portfolio.example.com';
const DEFAULT_OG_IMAGE = `${CANONICAL_BASE}/og-default.png`;

export default function SEOMeta({
  title = 'Student Portfolio Compass',
  description = 'Discover talented student developers, their academic achievements, and semester projects in one searchable portfolio directory.',
  path = '/',
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
}) {
  const canonical = `${CANONICAL_BASE}${path === '/' ? '' : path}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
