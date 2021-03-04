const mondayService = require('./monday.service');
// const transformationService = require('../services/transformation-service');
// const { TRANSFORMATION_TYPES } = require('../constants/transformation');
const axios = require('axios')
const initMondayClient = require('monday-sdk-js');


// async function executeAction(req, res) {
//   const { shortLivedToken } = req.session;
//   const { payload } = req.body;

//   try {
//     const { inputFields } = payload;
//     const { boardId, itemId, sourceColumnId, targetColumnId, transformationType } = inputFields;

//     const text = await mondayService.getColumnValue(shortLivedToken, itemId, sourceColumnId);
//     if (!text) {
//       return res.status(200).send({});
//     }
//     const transformedText = transformationService.transformText(
//       text,
//       transformationType ? transformationType.value : 'TO_UPPER_CASE'
//     );

//     await mondayService.changeColumnValue(shortLivedToken, boardId, itemId, targetColumnId, transformedText);

//     return res.status(200).send({});
//   } catch (err) {
//     console.error(err);
//     return res.status(500).send({ message: 'internal server error' });
//   }
// }

// async function getRemoteListOptions(req, res) {
//   try {
//     return res.status(200).send(TRANSFORMATION_TYPES);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).send({ message: 'internal server error' });
//   }
// }


async function testFunc(req, res) {
  const body = req.body
  res.json('yoyoyo')
  console.log('testFunc -> body', body)
}

async function getPrefixMap(req, res) {
  try {
    const prefixMapArr = await mondayService.getPrefixMap()
    const { prefixMap } = prefixMapArr[0]
    delete prefixMap._id
    res.json(prefixMap)
  } catch (err) {
    console.log('err: ', err);

  }
}

async function getWebHook(req, res) {
  const body = req.body
  if (!body?.event) return res.json({ 'challenge': body.challenge })
  
  const {  boardId, groupId, pulseId , columnId} = body.event
  console.log('getWebHook -> boardId', boardId)
  // console.log('getWebHook -> value', value)
  const prefixMap = await mondayService.getPrefixMapByBoardId(boardId)
  const token = process.env.MONDAY_API
  const monday = initMondayClient()
  monday.setToken(token)
  console.log('heyasdaksdaksjdhakjsdasdadask');
  
  const query = `mutation {
    change_simple_column_value (board_id: ${boardId}, item_id: ${pulseId}, column_id: ${prefixMap.targetColId}, value: ${JSON.stringify('100000')}) {
      id
    }
  }`
  const test = await monday.api(query)
  console.log('getWebHook -> test', test)
  const query2 = `mutation {
    create_item (board_id: ${boardId}, group_id: "${groupId}", item_name: "new item") {
    id
    }
    }`
  await monday.api(query2)
  
  // console.log('getWebHook -> challenge', challenge)
  // axios.post('https://api-gw.monday.com/automations/automations', {challenge})
}
async function tryWebHooks(req, res) {
  const testing = req.body
  console.log('tryWebHooks -> testing', testing)
  // console.log('getWebHook -> challenge', challenge)
  // axios.post('https://api-gw.monday.com/automations/automations', {challenge})
}

async function getPrefixMapByBoardId(req, res) {
  // const { boardId } = req.params
  const { boardId } = req.body
  console.log('getPrefixMapByBoardId -> boardId', boardId)
  try {
    const prefixMap = await mondayService.getPrefixMapByBoardId(boardId)
    res.json(prefixMap)

  } catch (err) {
    console.log('err: ', err);

  }
}

// async function updatePrefixMap(req, res) {
//   const { body: { prefixMap } } = req
//   const prefixMapArr = await mondayService.updatePrefixMap(prefixMap)
//   // console.log('updatePrefixMap -> prefixMapArr', prefixMapArr)
//   // const { prefixMap } = prefixMapArr[0]
//   // delete prefixMap._id
//   res.json(prefixMapArr)
// }

async function updatePrefixMap(req, res) {
  const { body: { prefixMap } } = req
  let prefixMapArr
  try {
    if (!prefixMap._id) {
      prefixMapArr = await mondayService.addPrefixMap(prefixMap)
    } else {
      prefixMapArr = await mondayService.updatePrefixMap(prefixMap)
    }

    res.json(prefixMapArr)
  } catch (err) {
    console.log('err: ', err);

  }

  // const { prefixMap } = prefixMapArr[0]
  // delete prefixMap._id
}



module.exports = {
  //   executeAction,
  //   getRemoteListOptions,
  testFunc,
  getPrefixMap,
  updatePrefixMap,
  getPrefixMapByBoardId,
  getWebHook,
  tryWebHooks
};
