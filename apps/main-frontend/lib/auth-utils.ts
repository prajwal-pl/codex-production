/**
 * Auth utility functions for client-side authentication checks
 */

/**
 * Check if user is authenticated by checking for auth token in localStorage
 * @returns true if user has a valid auth token, false otherwise
 */
export function isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;

    try {
        const token = localStorage.getItem("auth-token");
        return !!token;
    } catch {
        return false;
    }
}

/**
 * Get the appropriate route based on authentication status
 * @param protectedRoute - The route to navigate to if authenticated
 * @param fallbackRoute - The route to navigate to if not authenticated (default: /sign-in)
 * @returns The route to navigate to
 */
export function getAuthRoute(
    protectedRoute: string,
    fallbackRoute: string = "/sign-in"
): string {
    return isAuthenticated() ? protectedRoute : fallbackRoute;
}
