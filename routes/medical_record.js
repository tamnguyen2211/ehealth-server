var express = require('express');
var router = express.Router();
var request  = require('request');
var db = require('../db')
var ObjectID = require('mongodb').ObjectID;

// get all medical record
router.get('/', function(req,res){

	var dbo = db.get().db('eheath');

    dbo.collection('medical-records').find().toArray( (err, data) => {

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
        $set: newValue
    }
    dbo.collection("medical-records").updateOne(myquery, newValue, function(err, result) {
        if (err) throw err;
        dbo.collection('medical-records').find(myquery).toArray(function(err, result) {
            if (err) throw err;
            res.json(result);
        });
        
    });
})
//Return router
module.exports = router;