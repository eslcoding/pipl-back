const initMondayClient = require('monday-sdk-js');
const PREFIX_KEY = 'prefixKey'
// const dbService = require('./mongo-service')
const dbService = require('../../services/db.service');


// const fs = require('fs');

// var prefixMap = require('../data/prefixMap.json')


const ObjectId = require('mongodb').ObjectId;





/*REMOVE!*/
const storeBoardNum = (token) => {
  const mondayClient = initMondayClient({ token });

  // const boardKey = KEY + boardId
  mondayClient.storage.instance.getItem('boardKey').then(res => {
    const nextNum = res.data.value ? +res.data.value + 1 : 1
    // const 
    monday.storage.instance.setItem('boardKey', nextNum).then(res => {
      console.log(res);
    })
  })
}



async function getPrefixMap() {
  const collection = await dbService.getCollection('prefix')
  try {
    const prefix = await collection.find().toArray();

    return prefix
  } catch (err) {
    console.log('ERROR: cannot find prefix')
    throw err;
  }

}

async function getPrefixMapAll() {
  const collection = await dbService.getCollection('prefixMapTest')
  try {
    const prefix = await collection.find().toArray();

    return prefix
  } catch (err) {
    console.log('ERROR: cannot find prefix')
    throw err;
  }

}

async function getPrefixMapByBoardId(boardId) {
  const collection = await dbService.getCollection('prefix')
  try {
    // const prefix = await collection.find().toArray();
    const prefix = await collection.findOne({ boardId })


    return prefix
  } catch (err) {
    console.log('ERROR: cannot find prefix')
    throw err;
  }

}


function getNextPrefixCount(prefix, prefixMap) {
  prefixMap.map[prefix] = (prefixMap.map[prefix]) ? prefixMap.map[prefix] + 1 : 1
  return prefix + '-' + prefixMap.map[prefix]
}


async function addPrefixMap(prefixMap) {
  const collection = await dbService.getCollection('prefix')
  try {
    await collection.insertOne(prefixMap);

    return prefixMap
  } catch (err) {
    console.log('ERROR: cannot ADD prefix')
    throw err;
  }

}

async function updatePrefixMap(prefixMap) {
  const collection = await dbService.getCollection('prefix')
  try {
    const prefix = await collection.updateOne({ boardId: prefixMap.boardId }, { $set: { map: prefixMap.map, targetColId: prefixMap.targetColId } })
    return prefix
  } catch (err) {
    console.log('ERROR: cannot update prefix')
    throw err;
  }
}



async function updatePrefixMapAll(prefixMapAll) {
  prefixMapAll = prefixMapAll.map
  prefixMapAll._id = ObjectId(prefixMapAll._id)
  const collection = await dbService.getCollection('prefixMapTest')
  try {
    const prefix = await collection.updateOne({ _id: prefixMapAll._id }, { $set: { ...prefixMapAll } })
    return prefix
  } catch (err) {
    console.log('ERROR: cannot update prefix', err)
    throw err;
  }
}

async function resetPrefix(prefix) {
  if (!prefix) return

  try {
    const prefixMapArr = await getPrefixMapAll()
    const prefixMap = prefixMapArr[0]
    prefixMap[prefix] = 0
    await updatePrefixMapAll({ map: prefixMap })
    return
    // const prefix = await collection.updateOne({ _id: prefixMapAll._id }, { $set: { ...prefixMapAll } })
  } catch (err) {
    console.log('ERROR: cannot reset prefix', err)
    throw err;
  }
}


async function mappingScript() {
  const collection = await dbService.getCollection('prefix')
  try {
    // const prefixs = await collection.find({ srcColId: { $not: { $regex: /project_prefix/i } } }).toArray();
    const prefixs = await collection.find({ srcColId: { $regex: /project_prefix/i } }).toArray();
    // const prefixs = await collection.find().toArray();
    const prefixMap = prefixs.reduce((_prefixMap, prefixObj) => {
      for (let key in prefixObj.map) {
        _prefixMap[key] ??= 0
        _prefixMap[key] += prefixObj.map[key]
      }
      return _prefixMap
    }, {})


    const mapCollection = await dbService.getCollection('prefixMap')
    mapCollection.insertOne(prefixMap)

    return prefixs
  } catch (err) {
    console.log('ERROR: cannot find prefix', err)
    throw err;
  }
}




module.exports = {
  // getColumnValue,
  // changeColumnValue,
  getPrefixMap,
  updatePrefixMap,
  getPrefixMapByBoardId,
  addPrefixMap,
  getNextPrefixCount,
  getPrefixMapAll,
  updatePrefixMapAll,
  resetPrefix
};












// const dbService = require('../../services/db.service');
// const fetch = require('node-fetch');
// const logger = require('../../services/logger.service');
// var nodemailer = require('nodemailer');
// // const { monday } = require('../../config')
// // const { getUserByEmail } = require('../user/user.controller');
// const mondaySdk = require("monday-sdk-js")
// const monday = mondaySdk();

// monday.setToken(process.env.MONDAY_API);


// // apiCalls()


// async function apiCalls() {
//     // const { data: { users, boards } } = await monday.api('query { users { name, id } boards {id} }')
//     // const { id: boardId } = boards[0]
//     // const { id: userId } = users[0]
//     // // const {data} =  await monday.api(`query { boards (ids: ${boardId})`)
//     // let { data } = await monday.api(`query {boards (ids: ${boardId}) {items {id}}}`)
//     // let { items } = data.boards[0]


//     //     let to = await monday.api(`
//     //     mutation {
//     //       create_notification(
//     //         text: "I've got a notification for you!",
//     //         user_id: ${userId},
//     //         target_id: 1070970443,
//     //         target_type: Project,
//     //       ) { 
//     //         id 
//     //       }
//     //     }
//     //   `);



//     // const callback = res => console.log(res);
//     // const unsubscribe = monday.listen("events", callback);


// }



// // let query = '{boards(limit:1) { name id description items { name column_values{title id type text } } } }';

// // fetch ("https://api.monday.com/v2", {
// //   method: 'post',
// //   headers: {
// //     'Content-Type': 'application/json',
// //     'Authorization' : process.env.MONDAY_API
// //   },
// //   body: JSON.stringify({
// //     'query' : query
// //   })
// // })
// //   .then(res => res.json())
// //   .then(res => console.log(JSON.stringify(res, null, 2)));

// // emailTest()






