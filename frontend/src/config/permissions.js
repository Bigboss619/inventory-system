// Role-based permissions configuration
// Users: Super Admin, Inventory Officer, Document Officer, Staff

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  INVENTORY_OFFICER: 'Inventory Officer',
  DOCUMENT_OFFICER: 'Document Officer',
  STAFF: 'Staff'
};

// Route permissions mapping
export const ROUTE_PERMISSIONS = {
  '/dashboard': [ROLES.SUPER_ADMIN, ROLES.INVENTORY_OFFICER, ROLES.DOCUMENT_OFFICER, ROLES.STAFF],
  '/inventory/categories': [ROLES.SUPER_ADMIN, ROLES.INVENTORY_OFFICER],
  '/inventory/items': [ROLES.SUPER_ADMIN, ROLES.INVENTORY_OFFICER],
  '/inventory/stock-in': [ROLES.SUPER_ADMIN, ROLES.INVENTORY_OFFICER],
  '/inventory/stock-out': [ROLES.SUPER_ADMIN, ROLES.INVENTORY_OFFICER],
  '/inventory/staff': [ROLES.SUPER_ADMIN, ROLES.INVENTORY_OFFICER],
  '/inventory/history': [ROLES.SUPER_ADMIN, ROLES.INVENTORY_OFFICER],
  '/documents/vehicles': [ROLES.SUPER_ADMIN, ROLES.DOCUMENT_OFFICER],
  '/documents/all': [ROLES.SUPER_ADMIN, ROLES.DOCUMENT_OFFICER],
  '/documents/upload': [ROLES.SUPER_ADMIN, ROLES.DOCUMENT_OFFICER],
  '/documents/reminders': [ROLES.SUPER_ADMIN, ROLES.DOCUMENT_OFFICER],
  '/documents/maintenance': [ROLES.SUPER_ADMIN, ROLES.DOCUMENT_OFFICER],
  '/reports/inventory': [ROLES.SUPER_ADMIN, ROLES.INVENTORY_OFFICER],
  '/reports/documents': [ROLES.SUPER_ADMIN, ROLES.DOCUMENT_OFFICER],
  '/users': [ROLES.SUPER_ADMIN],
  '/admin/boardroom': [ROLES.SUPER_ADMIN],
  '/approved-bookings': [ROLES.SUPER_ADMIN, ROLES.INVENTORY_OFFICER],
  '/profile': [ROLES.SUPER_ADMIN, ROLES.INVENTORY_OFFICER, ROLES.DOCUMENT_OFFICER, ROLES.STAFF],
  '/settings': [ROLES.SUPER_ADMIN]
};

// Menu configuration with roles
export const MENU_BY_ROLE = {
  [ROLES.SUPER_ADMIN]: null, // Show all menus

  [ROLES.INVENTORY_OFFICER]: {
    Dashboard: null,
    'Boardroom': null,
    'Approved Bookings': null,
    'Inventory Management': [
      'Categories',
      'Items',
      'Stock In',
      'Stock Out',
      'Staff',
      'History'
    ]
  },

  [ROLES.DOCUMENT_OFFICER]: {
    Dashboard: null,
    'Document Management': [
      'Vehicle Records',
      'All Documents',
      'Bulk Upload',
      'Reminders',
      'Maintenance'
    ]
  },

  [ROLES.STAFF]: {
    Dashboard: null
  }
};

// Check if user has permission for a route
export const hasRoutePermission = (userRole, path) => {
  const allowedRoles = ROUTE_PERMISSIONS[path];
  if (!allowedRoles) return true; // Allow if route not defined (fallback)
  return allowedRoles.includes(userRole);
};

// Get accessible routes for a role
export const getAccessibleRoutes = (userRole) => {
  return Object.entries(ROUTE_PERMISSIONS)
    .filter(([_, roles]) => roles.includes(userRole))
    .map(([path]) => path);
};