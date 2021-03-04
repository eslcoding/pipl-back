const router = require('express').Router();
// const { authenticationMiddleware } = require('../middlewares/authentication');
const mondayController = require('./monday.controller');

// router.post('/monday/execute_action', authenticationMiddleware, mondayController.executeAction);
// router.post('/monday/get_remote_list_options', authenticationMiddleware, mondayController.getRemoteListOptions);
router.post('/test', mondayController.testFunc);
// router.get('/prefixMap', mondayController.getPrefixMap);
router.post('/updatePrefixMap', mondayController.updatePrefixMap);
// router.get('/getPrefixMap/:boardId', mondayController.getPrefixMapByBoardId);
router.post('/getPrefixMap', mondayController.getPrefixMapByBoardId);
router.post('/addColumn', mondayController.addColumn);
// router.post('/automations/automations', mondayController.getPrefixMapByBoardId);

module.exports = router;