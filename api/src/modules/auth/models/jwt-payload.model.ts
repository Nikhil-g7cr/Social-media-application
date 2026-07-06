export interface JwtPayload {
  /**
   * User ID (Subject)
   */
  sub: string;

  /**
   * User email address
   */
  email: string;

  /**
   * User roles
   * Example: ["ADMIN"] or ["USER"]
   */
  roles: string[];

  /**
   * User name
   */
  name?: string;

  /**
   * User profile picture url
   */
  image_url?: string;

  /**
   * Active session ID — used by logout and refresh flows
   * to target the exact session row without extra DB lookups.
   */
  sessionId?: string;
}