const roles = [
  { id: "super_admin", label: "Super Admin", mfaRequired: true },
  { id: "product_manager", label: "Product Manager", mfaRequired: false },
  { id: "inventory_manager", label: "Inventory Manager", mfaRequired: false },
  { id: "procurement_manager", label: "Procurement Manager", mfaRequired: true },
  { id: "crm_manager", label: "CRM Manager", mfaRequired: false },
  { id: "warehouse_operator", label: "Warehouse Operator", mfaRequired: false }
];

const accounts = [
  {
    id: "usr_super_admin",
    name: "Super Admin",
    roleId: "super_admin",
    phone: "+213 0559771275",
    password: "ferza123",
    mfaCode: "000000"
  },
  {
    id: "usr_product_manager",
    name: "Product Manager",
    roleId: "product_manager",
    phone: "+213 0555 222 333",
    password: "ferza123"
  },
  {
    id: "usr_inventory_manager",
    name: "Inventory Manager",
    roleId: "inventory_manager",
    phone: "+213 0555 333 444",
    password: "ferza123"
  },
  {
    id: "usr_procurement_manager",
    name: "Procurement Manager",
    roleId: "procurement_manager",
    phone: "+213 0555 444 555",
    password: "ferza123",
    mfaCode: "000000"
  },
  {
    id: "usr_crm_manager",
    name: "CRM Manager",
    roleId: "crm_manager",
    phone: "+213 0555 555 666",
    password: "ferza123"
  },
  {
    id: "usr_warehouse_operator",
    name: "Warehouse Operator",
    roleId: "warehouse_operator",
    phone: "+213 0555 666 777",
    password: "ferza123"
  }
];

module.exports = { roles, accounts };
