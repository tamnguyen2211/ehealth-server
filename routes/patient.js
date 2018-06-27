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
        dbo.collection("medical_records").findOne({patient_id: new ObjectID(patientId)}, (err, record) => {
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
router.get('/medical_advises', function(req, res){
    const patientId = req.headers["patient-auth"];

    if(!patientId){
        res.status(401).json({
            message: "Missing auhtentication",
            context: "Patient: Get Advises"
        })
        return;
    }

    var dbo = db.get().db('eheath');
    dbo.collection("patient").findOne({_id: new ObjectID(patientId)}, (err, patient) =>{
        if(err) throw err;
        if(!patient){
            res.status(401).json({
                message: "No authorization",
                context: "Patient: Get Advises"
            })
            return;
        }
        dbo.collection('medical_advises').find({patient_id: patientId}).toArray((err, advises) =>{
            if (err) throw err;
            res.json(advises);
        })
    })

})

router.post('/medical_advises/create', function(req, res){
    const patientId = req.headers["patient-auth"];

    if(!patientId){
        res.status(401).json({
            message: "Missing auhtentication",
            context: "Patient: Create Advise"
        })
        return;
    }

    const body = req.body;
    if(!body){
        res.status(400).json({
            message: "Missing body",
            context: "Patient: Create Advise"
        })
        return;
    }

    let { category, content, crated_at } = body;

    if(!category){
        res.status(400).json({
            message: "Missing advise category",
            context: "Patient: Create Advise"
        })
        return;
    }

    if(!content){
        res.status(400).json({
            message: "Missing advise content",
            context: "Patient: Create Advise"
        })
        return;
    }

    if(!created_at){
        body.created_at = moment().valueOf();
    }

    var dbo = db.get().db('eheath');
    dbo.collection("patient").findOne({_id: new ObjectID(patientId)}, (err, patient) =>{
        if(err) throw err;
        if(!patient){
            res.status(401).json({
                message: "No authorization",
                context: "Patient: Create Advise"
            })
            return;
        }
        body.patient_id = patientId;
        body.patient = {
            last_name: patient.last_name,
            first_name: patient.first_name,
            id: patientId
        }
        body.updated_at = body.created_at;
        body.status = 0;
        dbo.collection('medical_advises').insertOne(body, (err, data) => {
            if (err) throw err;
            // res.json(result);

            dbo.collection('medical_advises').find({patient_id: patientId}).toArray((err, advises) =>{
                if (err) throw err;
                res.json(advises);
            })
            
        });
    })

})
//Return router
module.exports = router;