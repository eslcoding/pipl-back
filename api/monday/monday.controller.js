const mondayService = require('./monday.service');
// const transformationService = require('../services/transformation-service');
// const { TRANSFORMATION_TYPES } = require('../constants/transformation');
const axios = require('axios')
const initMondayClient = require('monday-sdk-js');
const token = process.env.MONDAY_API  


// async function executeAction(req, res) {
//   const { shortLivedToken } = req.session;
  // const { payload } = req.body;

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
  try {

    const { boardId, groupId, pulseId, columnId, value } = body.event
    const { label: { text } } = value
    // console.log('getWebHook -> value', value)
    const prefixMap = await mondayService.getPrefixMapByBoardId(boardId)
    const nextPrefix = mondayService.getNextPrefixCount(text, prefixMap)
    const monday = initMondayClient()
    monday.setToken(token)

    const query = `mutation {
      change_simple_column_value (board_id: ${boardId}, item_id: ${pulseId}, column_id: ${prefixMap.targetColId}, value: ${JSON.stringify(nextPrefix)}) {
        id
      }
    }`
    const test = await monday.api(query)
    await mondayService.updatePrefixMap(prefixMap)
    res.end()
  } catch (err) {
    console.log('err: ', err);

  }

  // const query2 = `mutation {
  //   create_item (board_id: ${boardId}, group_id: "${groupId}", item_name: "new item") {
  //   id
  //   }
  //   }`
  // await monday.api(query2)

  // console.log('getWebHook -> challenge', challenge)
  // axios.post('https://api-gw.monday.com/automations/automations', {challenge})
}
async function getWebHookItem(req, res) {
  const body = req.body
  if (!body?.event) return res.json({ 'challenge': body.challenge })
  try {
    // console.log('body.event: ', body.event);
    const { boardId, pulseId: itemId } = body.event
    const prefixMap = await mondayService.getPrefixMapByBoardId(boardId)
    const monday = initMondayClient()
    monday.setToken(token)

    const query = `query {
    boards(ids: ${boardId}) {
      items(ids: ${itemId}) {
        column_values(ids: ${prefixMap?.srcColId}) {
          text
        }
      }
    }
  }`

    const { data: { boards } } = await monday.api(query)
    const items = boards[0].items
    const { text } = items[0].column_values[0]
    const nextPrefix = mondayService.getNextPrefixCount(text, prefixMap)
    await mondayService.updatePrefixMap(prefixMap)

    const query2 = `mutation {
    change_simple_column_value (board_id: ${boardId}, item_id: ${itemId}, column_id: ${prefixMap.targetColId}, value: ${JSON.stringify(nextPrefix)}) {
      id
    }
  }`

    let result = await monday.api(query2)
    console.log('getWebHookItem -> result', result)
    res.end()
  } catch (err) {
    console.log('err: ', err);

  }

}

async function addColumn(req, res) {
  const { query } = req.body
  try {

    const monday = initMondayClient()
    monday.setToken(token)
    let result = await monday.api(query)
    return res.json(result)

  } catch (error) {
    console.log('error: ', error);

  }
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
  getWebHookItem,
  addColumn
};
