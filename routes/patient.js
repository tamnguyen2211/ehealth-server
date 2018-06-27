var express = require('express');
var router = express.Router();
var request  = require('request');
var db = require('../db')
var ObjectID = require('mongodb').ObjectID;
var _ = require("underscore");

router.get('/', function(req,res){
    const patientId = req.headers["patient-auth"];

    if(!patientId){
        res.status(401).json({
            message: "Missing auhtentication",
            context: "Patient: Get patient detail"
        })
        return;
    }

    console.log(patientId);
    var dbo = db.get().db('eheath');
    dbo.collection("patient").findOne({_id: new ObjectID(patientId)}, (err, result) =>{
        if(err) throw err;
        if(!result){
            res.status(401).json({
                message: "No authorization",
                context: "Patient: Get patient detail"
            })
            return;
        }
        result.role="patient"
        res.json(_.omit(result, 'password'));

    })
});
router.get('/list', function(req,res){
    var dbo = db.get().db('eheath');
    dbo.collection("patient").find().toArray((err, result) =>{
        if(err) throw err;
        if(!result){
            res.status(401).json({
                message: "No authorization",
                context: "Patient: Get patient detail"
            })
            return;
        }
        res.json(result)

    })
});
//sign in
router.post('/signin', function(req, res){
    const id = req.params.id;
    let body = req.body;
    if(!body){
        res.status(400).json({
            message: "Missing body",
            context: "Patient: Sign in"
        })
        return;
    }
     let { username, password } = body;
    if(!username){
        res.status(400).json({
            message: "Missing username",
            context: "Patient: Sign in"
        })
        return;
    }

    if(!password){
        res.status(400).json({
            message: "Missing password",
            context: "Patient: Sign in"
        })
        return;
    }
    let dbo = db.get().db('eheath');

    let myquery = {
        username: username
    }
    dbo.collection("patient").findOne(myquery, (err, result) =>{
        if (err) throw err;
        if(!result){
            res.status(404).json({
                message: "Username not exist",
                context: "Patient: Sign in"
            })
            return;
        }
        if(result.password != password){
            res.status(401).json({
                message: "Password incorrect",
                context: "Patient: Sign in"
            })
            return;
        }

        
        res.json(_.omit(result, 'password'));

    });
})


router.get('/medical_records', function(req,res){
    const patientId = req.headers["patient-auth"];

    if(!patientId){
        res.status(401).json({
            message: "Missing auhtentication",
            context: "Patient: Get medical record"
        })
        return;
    }

    
    var dbo = db.get().db('eheath');
    dbo.collection("patient").findOne({_id: new ObjectID(patientId)}, (err, result) =>{
        if(err) throw err;
        if(!result){
            res.status(401).json({
                message: "No authorization",
                context: "Patient: Get medical record"
            })
            return;
        }
        dbo.collection("medical_records").find({patient_id: patientId}).toArray((err, record) => {
            if(err) throw err;
            if(!record){
                res.status(404).json({
                    id: patientId,
                    message: "Record not found",
                    context: "Patient: Get medical record"
                })
                return;
            }
            res.json(record);
        })
    })

});
//Return router
module.exports = router;