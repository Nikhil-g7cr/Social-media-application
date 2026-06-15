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
}