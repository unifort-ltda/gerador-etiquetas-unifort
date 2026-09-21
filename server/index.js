/**
 * Static host for the unchanged label generator. Access is controlled by the
 * hosting platform; this worker only serves the original files.
 */
function hasValidCredentials(request, env) {
  const authorization = request.headers.get("Authorization") || "";
  if (!authorization.startsWith("Basic ")) {
    return false;
  }

  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    if (separator < 0) {
      return false;
    }

    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    return username === env.GENERATOR_AUTH_USERNAME && password === env.GENERATOR_AUTH_PASSWORD;
  } catch {
    return false;
  }
}

function unauthorized() {
  return new Response("Acesso não autorizado.", {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "WWW-Authenticate": 'Basic realm="Gerador de Etiquetas Unifort", charset="UTF-8"',
    },
  });
}

export default {
  async fetch(request, env) {
    if (!hasValidCredentials(request, env)) {
      return unauthorized();
    }

    const url = new URL(request.url);

    if (url.pathname === "/") {
      url.pathname = "/index.html";
      return env.ASSETS.fetch(new Request(url, request));
    }

    return env.ASSETS.fetch(request);
  },
};
