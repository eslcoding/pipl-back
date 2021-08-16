const mondayService = require('./monday.service');
// const transformationService = require('../services/transformation-service');
// const { TRANSFORMATION_TYPES } = require('../constants/transformation');
const axios = require('axios')
const initMondayClient = require('monday-sdk-js');
const token = process.env.MONDAY_API




async function testFunc(req, res) {
  const body = req.body
  res.json('yoyoyo')
}

async function getPrefixMap(req, res) {
  try {
    const prefixMapArr = await mondayService.getPrefixMap()
    const { prefixMap } = prefixMapArr[0]
    delete prefixMap._id
    res.json(prefixMap)
  } catch (err) {
    console.log('err: ', err);
    res.end()

  }
}

async function getInter(req, res) {
  const body = req.body
  try {
    const { shortLivedToken } = req.session
    const { boardId, itemId } = body.payload.inboundFieldValues
    const prefixMap = await mondayService.getPrefixMapByBoardId(boardId)
    let prefixMapAll = await mondayService.getPrefixMapAll()
    prefixMapAll = { map: prefixMapAll[0] }
    console.log('hello integration');
    const monday = initMondayClient()
    monday.setToken(shortLivedToken)


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
    var nextPrefix = ''
    if (text) {
      // nextPrefix = mondayService.getNextPrefixCount(text, prefixMap)
      /*Change in production only when ready!! */
      nextPrefix = mondayService.getNextPrefixCount(text, prefixMapAll)
    }


    const query2 = `mutation {
      change_simple_column_value (board_id: ${boardId}, item_id: ${itemId}, column_id: ${prefixMap.targetColId}, value: ${JSON.stringify(nextPrefix)}) {
        id
      }
    }`
    const test = await monday.api(query2)
    await mondayService.updatePrefixMap(prefixMap)
    await mondayService.updatePrefixMapAll(prefixMapAll)
    res.end()
  } catch (err) {
    console.log('err: ', err);
    res.end()

  }
}




async function getInterItem(req, res) {
  const body = req.body
  try {
    const { shortLivedToken } = req.session
    const { boardId, itemId } = body.payload.inboundFieldValues
    const prefixMap = await mondayService.getPrefixMapByBoardId(boardId)
    const monday = initMondayClient()
    monday.setToken(shortLivedToken)


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


    const query2 = `mutation {
      change_simple_column_value (board_id: ${boardId}, item_id: ${itemId}, column_id: ${prefixMap.targetColId}, value: ${JSON.stringify(nextPrefix)}) {
        id
      }
    }`
    const test = await monday.api(query2)
    await mondayService.updatePrefixMap(prefixMap)
    res.end()
  } catch (err) {
    console.log('err: ', err);
    res.end()

  }
}


async function getWebHook(req, res) {
  const body = req.body
  if (!body?.event) return res.json({ 'challenge': body.challenge })
  try {

    const { boardId, groupId, pulseId, columnId, value } = body.event
    const { label: { text } } = value
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
    res.end()
  }

  // const query2 = `mutation {
  //   create_item (board_id: ${boardId}, group_id: "${groupId}", item_name: "new item") {
  //   id
  //   }
  //   }`
  // await monday.api(query2)

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
    res.end()
  } catch (err) {
    console.log('err: ', err);
    res.end()
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
    res.end()
  }
}



async function getPrefixMapByBoardId(req, res) {
  // const { boardId } = req.params
  const { boardId } = req.body
  try {
    const prefixMap = await mondayService.getPrefixMapByBoardId(boardId)
    res.json(prefixMap)

  } catch (err) {
    console.log('err: ', err);

  }
}

async function getPrefixMapAll(req, res) {
  // const { boardId } = req.params
  const { boardId } = req.body
  try {
    const prefixMap = await mondayService.getPrefixMapAll(boardId)
    res.json(prefixMap)

  } catch (err) {
    console.log('err: ', err);
    res.end()
  }
}


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
    res.end()
  }

  
}

async function updatePrefixMapAll(req, res) {
  const { body: { prefixMapAll } } = req
  let prefixMapArr
  try {
    prefixMapArr = await mondayService.updatePrefixMapAll(prefixMapAll)

    res.json(prefixMapArr)
  } catch (err) {
    console.log('err: ', err);
    res.end()
  }

 
}

async function resetPrefix(req, res) {
  const { body: { prefix } } = req
  try {
    await mondayService.resetPrefix(prefix)
    res.send()
  } catch (err) {
    console.log('err: ', err);
    
  } finally {
    res.end()
  }

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
  addColumn,
  getInter,
  getInterItem,
  getPrefixMapAll,
  updatePrefixMapAll,
  resetPrefix
};
