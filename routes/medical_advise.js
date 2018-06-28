var express = require('express');
var router = express.Router();
var request  = require('request');
var db = require('../db')
var ObjectID = require('mongodb').ObjectID;
var _ = require("underscore");
var moment = require('moment');
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

router.post('/:id/answer', function(req,res){
    const id = req.params.id;
    const doctorId = req.headers["doctor-auth"];

    if(!doctorId){
        res.status(401).json({
            message: "Missing auhtentication",
            context: "Doctor: Get medical advises"
        })
        return;
    }

    let value = req.body;
    if(!value){
        res.status(400).json({
            message: "Missing body"
        })
        return;
    }

    let { content, created_at } = value;
    if(!content){
        res.status(400).json({
            message: "Missing answer content"
        })
        return;
    }
    
    var dbo = db.get().db('eheath');
    dbo.collection("doctor").findOne({_id: new ObjectID(doctorId)}, (err, result) =>{
        if(err) throw err;
        if(!result){
            res.status(401).json({
                message: "No authorization",
                context: "Doctor: Post answer"
            })
            return;
        }

        if(!created_at){
            value.created_at = moment().valueOf();
        }

        value.doctor_id = doctorId;
        value.doctor = {
            id: doctorId,
            last_name: doctor.last_name,
            first_name: doctor.first_name
        }
        var myquery = { _id: new ObjectID(id)};
        value = {
            $push: {
                answers: value
            }
        }
        dbo.collection("medical_advises").updateOne(myquery, value, function(err, result) {
            if (err) throw err;
            dbo.collection('medical_advises').findOne(myquery, function(err, result) {
                if (err) throw err;
                res.json(result);
            });
            
        });
    })
    
    
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
    dbo.collection("medical_advises").updateOne(myquery, value, function(err, result) {
        if (err) throw err;
        dbo.collection('medical_advises').findOne(myquery, function(err, result) {
            if (err) throw err;
            res.json(result);
        });
        
    });
})

router.get('/:id', function(req,res){
    const id = req.params.id;
    
    var dbo = db.get().db('eheath');
    dbo.collection("medical_advises").findOne({ _id: new ObjectID(id)}, (err, record) => {
        if(err) throw err;
        if(!record){
            res.json({});
        }
        res.json(record);
    })

});
//Return router
module.exports = router;