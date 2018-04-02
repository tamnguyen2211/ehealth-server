var express = require('express');
var router = express.Router();
var request  = require('request');
var db = require('../db')

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

//Return router
module.exports = router;