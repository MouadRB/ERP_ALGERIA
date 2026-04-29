const express = require('express');

const router = express.Router();

router.use('/oms', require('./oms.routes'));
router.use('/pim', require('./pim.routes'));
router.use('/catalogue', require('./catalogue.routes'));
router.use('/inventory', require('./inventory.routes'));
router.use('/crm', require('./crm.routes'));
router.use('/procurement', require('./procurement.routes'));
router.use('/rapports', require('./rapports.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/notifications', require('./notifications.routes'));
router.use('/parametres', require('./parametres.routes'));
router.use('/tenants/invites', require('./invites.routes'));
router.use('/tenants/users', require('./tenants.users.routes'));

module.exports = router;