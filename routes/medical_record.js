var express = require('express');
var router = express.Router();
var request  = require('request');
var db = require('../db')
var ObjectID = require('mongodb').ObjectID;
var _ = require("underscore");

// get all medical record
router.get('/', function(req,res){

	var dbo = db.get().db('eheath');

    dbo.collection('medical_records').find().toArray( (err, data) => {

        if (err) throw err;

        res.json(data);
    });
});

//insert medical record
router.post('/', function(req,res){
	const medical_record = req.body;

	var dbo = db.get().db('eheath');

    dbo.collection('medical-records').insertOne(medical_record, (err, data) => {

        if (err) throw err;

        res.json(data);
    });
});


router.post('/:id', function(req,res){
    const id = req.params.id;
    let newValue = req.body;
    if(!newValue){
        res.status(400).json({
            message: "Missing body"
        })
        return;
    }
    var dbo = db.get().db('eheath');
    var myquery = { _id: new ObjectID(id)};
    newValue = {
        $push: newValue
    }
    dbo.collection("medical_records").updateOne(myquery, newValue, function(err, result) {
        if (err) throw err;
        dbo.collection('medical_records').findOne(myquery, function(err, result) {
            if (err) throw err;
            res.json(result);
        });
        
    });
})

router.post('/:id/delete', function(req,res){
    const id = req.params.id;
    let value = req.body;
    if(!value){
        res.status(400).json({
            message: "Missing body"
        })
        return;
    }
    var dbo = db.get().db('eheath');
    var myquery = { _id: new ObjectID(id)};
    value = {
        $pull: value
    }
    dbo.collection("medical_records").updateOne(myquery, value, function(err, result) {
        if (err) throw err;
        dbo.collection('medical_records').findOne(myquery, function(err, result) {
            if (err) throw err;
            res.json(result);
        });
        
    });
})

router.post('/:id/update', function(req,res){
    const id = req.params.id;
    let value = req.body;
    if(!value){
        res.status(400).json({
            message: "Missing body"
        })
        return;
    }
    var dbo = db.get().db('eheath');
    var myquery = { _id: new ObjectID(id)};
    value = {
        $set: value
    }
    dbo.collection("medical_records").updateOne(myquery, value, function(err, result) {
        if (err) throw err;
        dbo.collection('medical_records').findOne(myquery, function(err, result) {
            if (err) throw err;
            res.json(result);
        });
        
    });
})

router.get('/:id', function(req,res){
    const id = req.params.id;
    
    var dbo = db.get().db('eheath');
    dbo.collection("medical_records").findOne({ _id: new ObjectID(id)}, (err, record) => {
        if(err) throw err;
        if(!record){
            res.json({});
        }
        res.json(record);
    })

});
//Return router
module.exports = router;