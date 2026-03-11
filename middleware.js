const PASSWORD = 'rueprincipale2026';
const COOKIE_NAME = 'rp_auth';

export default function middleware(request) {
  const url = new URL(request.url);

  // Allow static assets through
  if (
    url.pathname.startsWith('/brand/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname === '/robots.txt' ||
    url.pathname === '/favicon.ico'
  ) {
    return;
  }

  // Handle password submission
  if (url.pathname === '/_auth' && request.method === 'POST') {
    return handleAuth(request);
  }

  // Check for auth cookie
  const cookie = request.headers.get('cookie') || '';
  const hasAuth = cookie.split(';').some(c => c.trim().startsWith(`${COOKIE_NAME}=`));

  if (hasAuth) {
    const token = cookie.split(';').find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
    if (token && token.trim().split('=')[1] === btoa(PASSWORD)) {
      return; // Authenticated
    }
  }

  // Show password page
  return new Response(passwordPage(), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

async function handleAuth(request) {
  const body = await request.text();
  const params = new URLSearchParams(body);
  const password = params.get('password');

  if (password === PASSWORD) {
    const redirect = new URL('/', request.url);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirect.toString(),
        'Set-Cookie': `${COOKIE_NAME}=${btoa(PASSWORD)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
      },
    });
  }

  return new Response(passwordPage('Mot de passe incorrect.'), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function passwordPage(error = '') {
  return `<!DOCTYPE html>
<html lang="fr-CA">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Rue Principale — Accès protégé</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;1,400&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Outfit', -apple-system, sans-serif;
      background: #0f1a2e;
      color: #f8f2e8;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-font-smoothing: antialiased;
    }
    .gate {
      text-align: center;
      padding: 2rem;
      max-width: 400px;
      width: 100%;
    }
    .gate-mark {
      width: 48px;
      height: auto;
      opacity: 0.15;
      margin-bottom: 3rem;
    }
    .gate h1 {
      font-family: 'Lora', Georgia, serif;
      font-size: 1.75rem;
      font-weight: 400;
      letter-spacing: -0.02em;
      margin-bottom: 0.75rem;
    }
    .gate p {
      font-size: 0.9rem;
      color: #c8bfb0;
      margin-bottom: 2.5rem;
      line-height: 1.6;
    }
    form { display: flex; flex-direction: column; gap: 1rem; }
    input[type="password"] {
      font-family: 'Outfit', sans-serif;
      font-size: 0.9rem;
      padding: 0.85rem 1.25rem;
      border: 1px solid rgba(248, 242, 232, 0.15);
      border-radius: 8px;
      background: rgba(248, 242, 232, 0.04);
      color: #f8f2e8;
      outline: none;
      transition: border-color 0.3s;
      text-align: center;
      letter-spacing: 0.1em;
    }
    input[type="password"]:focus {
      border-color: rgba(248, 242, 232, 0.35);
    }
    input[type="password"]::placeholder {
      color: rgba(248, 242, 232, 0.25);
      letter-spacing: 0.04em;
    }
    button {
      font-family: 'Outfit', sans-serif;
      font-size: 0.8125rem;
      font-weight: 500;
      letter-spacing: 0.04em;
      padding: 0.85rem 2rem;
      border-radius: 100px;
      border: none;
      background: #b8922e;
      color: #fff;
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    button:hover {
      background: #c9a33f;
      transform: translateY(-1px);
    }
    .error {
      font-size: 0.8rem;
      color: #e05252;
      margin-top: -0.25rem;
    }
  </style>
</head>
<body>
  <div class="gate">
    <img src="/brand/mark-cream.svg" alt="" class="gate-mark" aria-hidden="true">
    <h1>Accès protégé</h1>
    <p>Ce site est en développement. Entrez le mot de passe pour continuer.</p>
    <form method="POST" action="/_auth">
      <input type="password" name="password" placeholder="Mot de passe" autofocus required>
      ${error ? `<p class="error">${error}</p>` : ''}
      <button type="submit">Accéder au site</button>
    </form>
  </div>
</body>
</html>`;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
