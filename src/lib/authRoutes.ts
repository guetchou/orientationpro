/** Routes d'authentification affichées en plein écran, sans header ni footer du site. */
export const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

export const isAuthRoute = (pathname: string): boolean => AUTH_ROUTES.includes(pathname);
