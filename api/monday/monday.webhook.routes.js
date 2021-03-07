const router = require('express').Router();
const { authenticationMiddleware } = require('../../middlewares/requireAuth.middleware');

const mondayController = require('./monday.controller');

router.post('/auto', mondayController.getWebHook);
router.post('/inter',authenticationMiddleware, mondayController.getInter);
router.post('/interItem',authenticationMiddleware, mondayController.getInterItem);
router.post('/item', mondayController.getWebHookItem);
// router.post('/auto',authenticationMiddleware, mondayController.getWebHook);
// router.post('/auto', mondayController.tryWebHooks);

module.exports = router;