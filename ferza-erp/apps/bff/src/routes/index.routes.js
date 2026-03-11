import { Router } from "express";

import { omsRouter } from "./oms.routes.js";
import { pimRouter } from "./pim.routes.js";
import { catalogueRouter } from "./catalogue.routes.js";
import { inventoryRouter } from "./inventory.routes.js";
import { crmRouter } from "./crm.routes.js";
import { procurementRouter } from "./procurement.routes.js";
import { rapportsRouter } from "./rapports.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { notificationsRouter } from "./notifications.routes.js";
import { parametresRouter } from "./parametres.routes.js";

export const indexRouter = Router();

indexRouter.use("/oms", omsRouter);
indexRouter.use("/pim", pimRouter);
indexRouter.use("/catalogue", catalogueRouter);
indexRouter.use("/inventory", inventoryRouter);
indexRouter.use("/crm", crmRouter);
indexRouter.use("/procurement", procurementRouter);
indexRouter.use("/rapports", rapportsRouter);
indexRouter.use("/dashboard", dashboardRouter);
indexRouter.use("/notifications", notificationsRouter);
indexRouter.use("/parametres", parametresRouter);
