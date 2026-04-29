const roles = [
  { id: "SuperAdmin", label: "SuperAdmin" },
  { id: "ProductManager", label: "ProductManager" },
  { id: "InventoryManager", label: "InventoryManager" },
  { id: "FinanceManager", label: "FinanceManager" },
  { id: "WarehouseOperator", label: "WarehouseOperator" },
  { id: "ProcurementManager", label: "ProcurementManager" },
  { id: "CRMAgent", label: "CRMAgent" },
  { id: "LogisticsAgent", label: "LogisticsAgent" },
  { id: "ReportingAnalyst", label: "ReportingAnalyst" }
];

const accounts = [
  {
    id: "usr_super_admin",
    fullName: "Super Admin",
    email: "superadmin@ferza.dz",
    password: "TestPass123!",
    rawRole: "SuperAdmin"
  },
  {
    id: "usr_product_manager",
    fullName: "Product Manager",
    email: "productmanager@ferza.dz",
    password: "TestPass123!",
    rawRole: "ProductManager"
  },
  {
    id: "usr_inventory_manager",
    fullName: "Inventory Manager",
    email: "inventorymanager@ferza.dz",
    password: "TestPass123!",
    rawRole: "InventoryManager"
  },
  {
    id: "usr_finance_manager",
    fullName: "Finance Manager",
    email: "financemanager@ferza.dz",
    password: "TestPass123!",
    rawRole: "FinanceManager"
  },
  {
    id: "usr_warehouse_operator",
    fullName: "Warehouse Operator",
    email: "warehouseoperator@ferza.dz",
    password: "TestPass123!",
    rawRole: "WarehouseOperator"
  },
  {
    id: "usr_procurement_manager",
    fullName: "Procurement Manager",
    email: "procurementmanager@ferza.dz",
    password: "TestPass123!",
    rawRole: "ProcurementManager"
  },
  {
    id: "usr_crm_agent",
    fullName: "CRM Agent",
    email: "crmagent@ferza.dz",
    password: "TestPass123!",
    rawRole: "CRMAgent"
  },
  {
    id: "usr_logistics_agent",
    fullName: "Logistics Agent",
    email: "logisticsagent@ferza.dz",
    password: "TestPass123!",
    rawRole: "LogisticsAgent"
  },
  {
    id: "usr_reporting_analyst",
    fullName: "Reporting Analyst",
    email: "reportinganalyst@ferza.dz",
    password: "TestPass123!",
    rawRole: "ReportingAnalyst"
  }
];

module.exports = { roles, accounts };
