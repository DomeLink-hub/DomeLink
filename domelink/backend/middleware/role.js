// Accepts Prisma enum roles (CLIENT, ARCHITECT, ADMIN, SUPERADMIN) or mapped string roles
export function requireRole(role) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: 'Forbidden: No user' });
        }
        // Map string roles to Prisma enum
        const roleMap = {
            homeowner: 'CLIENT',
            architect: 'ARCHITECT',
            admin: 'ADMIN',
            superadmin: 'SUPERADMIN',
        };
        const expectedRole = roleMap[role] || role;
        if (req.user.role !== expectedRole) {
            return res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }
        next();
    };
}
