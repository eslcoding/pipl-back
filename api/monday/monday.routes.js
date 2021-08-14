const router = require('express').Router();
const mondayController = require('./monday.controller');
const authController = require('../auth/auth.controller');

// router.post('/monday/execute_action', authenticationMiddleware, mondayController.executeAction);
// router.post('/monday/get_remote_list_options', authenticationMiddleware, mondayController.getRemoteListOptions);
router.post('/test', mondayController.testFunc);
router.post('/auth', authController.authorization);
// router.get('/prefixMap', mondayController.getPrefixMap);
router.post('/updatePrefixMap', mondayController.updatePrefixMap);
router.post('/updatePrefixMapAll', mondayController.updatePrefixMapAll);
// router.get('/getPrefixMap/:boardId', mondayController.getPrefixMapByBoardId);
router.post('/getPrefixMap', mondayController.getPrefixMapByBoardId);
router.post('/getPrefixMapAll', mondayController.getPrefixMapAll);
router.post('/addColumn', mondayController.addColumn);
router.post('/resetPrefix', mondayController.resetPrefix);
// router.post('/automations/automations', mondayController.getPrefixMapByBoardId);

module.exports = router;