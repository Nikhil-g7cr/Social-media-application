export class Roles {
    static ADMIN = 'admin';
    static USER = 'user';
    static DEVELOPER = 'developer';
    static TESTER = 'tester';
    static MANAGER = 'manager';
    static GUEST = 'guest';

    // Add this helper method to map roles to URL prefixes
    static getRolePrefix(role: string|undefined): string {
        switch (role) {
            case this.MANAGER: return 'manager';
            case this.ADMIN: return 'admin';
            default: return 'user';
        }
    }
}