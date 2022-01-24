const mondayService = require("./monday.service");
// const transformationService = require('../services/transformation-service');
// const { TRANSFORMATION_TYPES } = require('../constants/transformation');
const axios = require("axios");
const initMondayClient = require("monday-sdk-js");
const token = process.env.MONDAY_API;
var gInc = 1;
global.isReqOn = false;

async function testFunc(req, res) {
  const body = req.body;
  res.json("yoyoyo");
}
/**
 * gets prefix map object
 * @param {*} req
 * @param {*} res
 * @constant {object} prefixMap prefix map without id
 */
async function getPrefixMap(req, res) {
  try {
    const prefixMapArr = await mondayService.getPrefixMap();
    const { prefixMap } = prefixMapArr[0];
    delete prefixMap._id;
    res.json(prefixMap);
  } catch (err) {
    console.log("err: ", err);
    res.end();
  }
}
/**
 * main integration function
 * @param {*} req
 * @param {*} res
 * queries to monday => gets column value by DB value
 * mutates the same column and adds 1 to existing prefix or crates a new one
 */
async function getInter(req, res) {
  const body = req.body;
  console.log(`getInter -> body`, body);
  try {
    if (global.isReqOn) {
      await sleep(3000);
      return getInter(req, res);
    }
    console.log("wake up");
    console.log(`getInter ->  global.isReqOn`, global.isReqOn);
    global.isReqOn = true;
  } catch (err) {
    console.log(`getInter -> err`, err);
  }
  try {
    console.log("inter");
    const { shortLivedToken } = req.session;
    if (gInc === 1) {
      setTimeout(() => (gInc = 1), 3000);
    }

    const { boardId, itemId } = body.payload.inboundFieldValues;
    const prefixMap = await mondayService.getPrefixMapByBoardId(
      Number(boardId)
    );
    console.log(`getInter -> prefixMap`, prefixMap);
    let prefixMapAll = await mondayService.getPrefixMapAll();
    console.log(`getInter -> prefixMapAll`, prefixMapAll);

    prefixMapAll = { map: prefixMapAll[0] };
    const monday = initMondayClient();
    monday.setToken(shortLivedToken);

    const query = `query {
      boards(ids: ${boardId}) {
        items(ids: ${itemId}) {
          column_values(ids: ${prefixMap?.srcColId}) {
            text
            type
          }
        }
      }
    }`;
    console.log(`getInter -> query`, query);

    const result = await monday.api(query);
    console.log(`getInter -> result`, result);

    const items = result.data.boards[0].items;
    console.log(
      `getInter -> items[0].column_values[0]`,
      items[0].column_values[0]
    );
    const text = items[0].column_values[0].text;
    // items[0].column_values[0].type === "color"
    //   ? items[0].column_values[0].text
    //   : items[0].column_values[0].value;
    var nextPrefix = "";
    console.log(`getInter -> text`, text);
    if (text) {
      // nextPrefix = mondayService.getNextPrefixCount(text, prefixMap)
      /*Change in production only when ready!! */

      nextPrefix = mondayService.getNextPrefixCount(text, prefixMapAll, gInc);
      console.log(`getInter -> nextPrefix`, nextPrefix);
      gInc++;
    }
    console.log("hi im here!!");
    const query2 = `mutation {
      change_simple_column_value (board_id: ${boardId}, item_id: ${itemId}, column_id: ${
      prefixMap.targetColId
    }, value: ${JSON.stringify(nextPrefix)}) {
        id
        name
      }
    }`;
    const test = await monday.api(query2);
    console.log(`getInter -> test`, test);
    await mondayService.updatePrefixMap(prefixMap);
    await mondayService.updatePrefixMapAll(prefixMapAll);
    res.end();
  } catch (err) {
    console.log("err: ", err);
    res.end();
  } finally {
    global.isReqOn = false;
    res.end();
  }
}

function sleep(time) {
  console.log(`sleep -> time`, `${time / 1000}s`);
  return new Promise((res, rej) => setTimeout(res, time));
}

async function getInterItem(req, res) {
  const body = req.body;
  try {
    const { shortLivedToken } = req.session;
    const { boardId, itemId } = body.payload.inboundFieldValues;
    const prefixMap = await mondayService.getPrefixMapByBoardId(boardId);
    const monday = initMondayClient();
    monday.setToken(shortLivedToken);

    const query = `query {
      boards(ids: ${boardId}) {
        items(ids: ${itemId}) {
          column_values(ids: ${prefixMap?.srcColId}) {
            text
            type
          }
        }
      }
    }`;

    const {
      data: { boards },
    } = await monday.api(query);
    const items = boards[0].items;
    const { text } = items[0].column_values[0];
    const { type } = items[0].column_values[0];
    const nextPrefix = mondayService.getNextPrefixCount(text, prefixMap);

    const query2 =
      type === "text"
        ? `mutation {
      change_column_value (board_id: ${boardId}, item_id: ${itemId}, column_id: ${
            prefixMap.targetColId
          }, value: ${JSON.stringify(nextPrefix)}) {
        id
      }
    }`
        : `mutation {
      change_simple_column_value (board_id: ${boardId}, item_id: ${itemId}, column_id: ${
            prefixMap.targetColId
          }, value: ${JSON.stringify(nextPrefix)}) {
        id
      }
    }`;
    const test = await monday.api(query2);
    await mondayService.updatePrefixMap(prefixMap);
    res.end();
  } catch (err) {
    console.log("err: ", err);
    res.end();
  }
}

async function getWebHook(req, res) {
  const body = req.body;
  if (!body?.event) return res.json({ challenge: body.challenge });
  try {
    const { boardId, groupId, pulseId, columnId, value } = body.event;
    const {
      label: { text },
    } = value;
    const prefixMap = await mondayService.getPrefixMapByBoardId(boardId);
    const nextPrefix = mondayService.getNextPrefixCount(text, prefixMap);
    const monday = initMondayClient();
    monday.setToken(token);

    const query = `mutation {
      change_simple_column_value (board_id: ${boardId}, item_id: ${pulseId}, column_id: ${
      prefixMap.targetColId
    }, value: ${JSON.stringify(nextPrefix)}) {
        id
      }
    }`;
    const test = await monday.api(query);
    await mondayService.updatePrefixMap(prefixMap);
    res.end();
  } catch (err) {
    console.log("err: ", err);
    res.end();
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
  const body = req.body;
  if (!body?.event) return res.json({ challenge: body.challenge });
  try {
    // console.log('body.event: ', body.event);
    const { boardId, pulseId: itemId } = body.event;
    const prefixMap = await mondayService.getPrefixMapByBoardId(boardId);
    const monday = initMondayClient();
    monday.setToken(token);

    const query = `query {
    boards(ids: ${boardId}) {
      items(ids: ${itemId}) {
        column_values(ids: ${prefixMap?.srcColId}) {
          text
        }
      }
    }
  }`;

    const {
      data: { boards },
    } = await monday.api(query);
    const items = boards[0].items;
    const { text } = items[0].column_values[0];
    const nextPrefix = mondayService.getNextPrefixCount(text, prefixMap);
    await mondayService.updatePrefixMap(prefixMap);

    const query2 = `mutation {
    change_simple_column_value (board_id: ${boardId}, item_id: ${itemId}, column_id: ${
      prefixMap.targetColId
    }, value: ${JSON.stringify(nextPrefix)}) {
      id
    }
  }`;

    let result = await monday.api(query2);
    res.end();
  } catch (err) {
    console.log("err: ", err);
    res.end();
  }
}

async function addColumn(req, res) {
  const { query } = req.body;
  try {
    const monday = initMondayClient();
    monday.setToken(token);
    let result = await monday.api(query);
    return res.json(result);
  } catch (error) {
    console.log("error: ", error);
    res.end();
  }
}

async function getPrefixMapByBoardId(req, res) {
  // const { boardId } = req.params
  const { boardId } = req.body;
  try {
    const prefixMap = await mondayService.getPrefixMapByBoardId(boardId);
    res.json(prefixMap);
  } catch (err) {
    console.log("err: ", err);
  }
}

async function getPrefixMapAll(req, res) {
  // const { boardId } = req.params
  const { boardId } = req.body;
  try {
    const prefixMap = await mondayService.getPrefixMapAll(boardId);
    res.json(prefixMap);
  } catch (err) {
    console.log("err: ", err);
    res.end();
  }
}

async function updatePrefixMap(req, res) {
  const {
    body: { prefixMap },
  } = req;
  let prefixMapArr;
  try {
    if (!prefixMap._id) {
      prefixMapArr = await mondayService.addPrefixMap(prefixMap);
    } else {
      prefixMapArr = await mondayService.updatePrefixMap(prefixMap);
    }

    res.json(prefixMapArr);
  } catch (err) {
    console.log("err: ", err);
    res.end();
  }
}

async function updatePrefixMapAll(req, res) {
  const {
    body: { prefixMapAll },
  } = req;
  let prefixMapArr;
  try {
    prefixMapArr = await mondayService.updatePrefixMapAll(prefixMapAll);

    res.json(prefixMapArr);
  } catch (err) {
    console.log("err: ", err);
    res.end();
  }
}

async function resetPrefix(req, res) {
  const {
    body: { prefix },
  } = req;
  try {
    await mondayService.resetPrefix(prefix);
    res.send();
  } catch (err) {
    console.log("err: ", err);
  } finally {
    res.end();
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
  resetPrefix,
};
