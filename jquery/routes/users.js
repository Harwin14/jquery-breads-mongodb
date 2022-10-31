var express = require('express');
var router = express.Router();
const { ObjectId } = require('mongodb')

module.exports = function (db) {
  const collection = db.collection('breads');

  router.get('/', async (req, res, next) => {
    try {
      //searching
      const { string, integer, float, startDate, endDate, boolean } = req.query
      const params = {}
      if (string) {
        params['string'] = new RegExp(string, 'i')
      }
      if (integer) {
        params['integer'] = parseInt(integer)
      }
      if (float) {
        params['float'] = JSON.parse(float)
      }

    
      if (startDate && endDate) {
        params['date'] = { $gte: new Date(startDate), $lte: new Date(endDate) }
      }else if (startDate) {
        params['date'] = { $gte: new Date(startDate) }
      }else if (endDate) {
        params['date'] = { $lte: new Date(endDate) }
      }
      
      if (boolean) {
        params['boolean'] = boolean
      }
      console.log(params)

      const page = req.query.page || 1
      const limit = 3
      const offset = (page - 1) * limit
      const total = await collection.countDocuments(params)
      const pages = Math.ceil(total / limit)
      const findResult = await collection.find(params).limit(limit).skip(offset).toArray()
      res.status(200).json({
        data: findResult,
        page: parseInt(page),
        pages: pages,
        offset

      })
    } catch (e) {
      console.log(e)
      res.json(e)
    }
  })
  //CREATE
  router.post('/', async function (req, res, next) {
    try {                                              //string: req.body.string, integer: parseInt(req.body.integer), float: JSON.parse(req.body.float), date: new Date(req.body.date), boolean: req.body.boolean
      const insertResult = await collection.insertOne({ string: req.body.string, integer: parseInt(req.body.integer), float: JSON.parse(req.body.float), date: new Date(req.body.date), boolean: req.body.boolean });
      res.status(201).json(insertResult)
    } catch (e) {
      res.json(e)
    }
  });
  //EDIT
  router.put('/:id', async function (req, res, next) {
    try {
      const updateResult = await collection.updateOne({ _id: ObjectId(req.params.id) }, { $set: { string: req.body.string, integer: parseInt(req.body.integer), float: JSON.parse(req.body.float), date: new Date(req.body.date), boolean: req.body.boolean } });
      res.status(201).json(updateResult)
    } catch (e) {
      res.json(e)
    }
  });
  //DELETE
  router.delete('/:id', async function (req, res, next) {
    try {
      const deleteResult = await collection.deleteOne({ _id: ObjectId(req.params.id) });
      res.status(201).json(deleteResult)
    } catch (e) {
      res.json(e)
    }
  });

  return router;
}