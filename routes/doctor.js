var express = require('express');
var router = express.Router();
var request  = require('request');
var db = require('../db')
var ObjectID = require('mongodb').ObjectID;
var _ = require("underscore");
var moment = require('moment');

// get all medical record
// router.get('/', function(req,res){

// 	var dbo = db.get().db('eheath');

//     dbo.collection('doctor').find().toArray( (err, data) => {

//         if (err) throw err;

//         res.json(data);
//     });
// });

router.get('/', function(req,res){
    const doctorId = req.headers["doctor-auth"];

    if(!doctorId){
        res.status(401).json({
            message: "Missing auhtentication",
            context: "Doctor: Get doctor detail"
        })
        return;
    }

    var dbo = db.get().db('eheath');
    dbo.collection("doctor").findOne({_id: new ObjectID(doctorId)}, (err, result) =>{
        if(err) throw err;
        if(!result){
            res.status(401).json({
                message: "No authorization",
                context: "Doctor: Get doctor detail"
            })
            return;
        }
        result.role="doctor";
        res.json(_.omit(result, 'password'));

    })
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

//sign in
router.post('/signin', function(req, res){
    const id = req.params.id;
    let body = req.body;
    if(!body){
        res.status(400).json({
            message: "Missing body",
            context: "Doctor: Sign in"
        })
        return;
    }

    let { username, password } = body;
    if(!username){
        res.status(400).json({
            message: "Missing username",
            context: "Doctor: Sign in"
        })
        return;
    }

    if(!password){
        res.status(400).json({
            message: "Missing password",
            context: "Doctor: Sign in"
        })
        return;
    }
    let dbo = db.get().db('eheath');

    let myquery = {
        username: username
    }
    dbo.collection("doctor").findOne(myquery, (err, result) =>{
        if (err) throw err;
        if(!result){
            res.status(404).json({
                message: "Username not exist",
                context: "Doctor: Sign in"
            })
            return;
        }
        if(result.password != password){
            res.status(401).json({
                message: "Password incorrect",
                context: "Doctor: Sign in"
            })
            return;
        }

        
        res.json(_.omit(result, 'password'));

    });
})

router.get('/patient_list', function(req,res){
    const doctorId = req.headers["doctor-auth"];

    if(!doctorId){
        res.status(401).json({
            message: "Missing auhtentication",
            context: "Doctor: Create Patient"
        })
        return;
    }

    
    var dbo = db.get().db('eheath');
    dbo.collection("doctor").findOne({_id: new ObjectID(doctorId)}, (err, doctor) =>{
        if(err) throw err;
        if(!doctor){
            res.status(401).json({
                message: "No authorization",
                context: "Doctor: Create patient"
            })
            return;
        }
        dbo.collection("patient").find({created_by: doctorId}).toArray((err, patientList) => {
            if(err) throw err;
            res.json(patientList);
        })
    })

});

router.post('/create_patient', function(req,res){
    const doctorId = req.headers["doctor-auth"];

    if(!doctorId){
        res.status(401).json({
            message: "Missing auhtentication",
            context: "Doctor: Create Patient"
        })
        return;
    }

    const body = req.body;
    if(!body){
        res.status(400).json({
            message: "Missing body",
            context: "Doctor: Create patient"
        })
        return;
    }

    let { first_name, last_name, username, emergency, insurance, tel, mail, address, note, password } = body;

    if(!first_name){
        res.status(400).json({
            message: "Missing patient first name",
            context: "Doctor: Create patient"
        })
        return;
    }

    if(!last_name){
        res.status(400).json({
            message: "Missing patient last name",
            context: "Doctor: Create patient"
        })
        return;
    }

    if(!username){
        res.status(400).json({
            message: "Missing patient username",
            context: "Doctor: Create patient"
        })
        return;
    }

    if(!tel){
        res.status(400).json({
            message: "Missing patient telephone",
            context: "Doctor: Create patient"
        })
        return;
    }

    if(!password){
        res.status(400).json({
            message: "Missing password",
            context: "Doctor: Create patient"
        })
        return;
    }

    if(!address){
        res.status(400).json({
            message: "Missing address",
            context: "Doctor: Create patient"
        })
        return;
    }

    if(!mail){
        res.status(400).json({
            message: "Missing mail",
            context: "Doctor: Create patient"
        })
        return;
    }

    var dbo = db.get().db('eheath');
    dbo.collection("doctor").findOne({_id: new ObjectID(doctorId)}, (err, doctor) =>{
        if(err) throw err;
        if(!doctor){
            res.status(401).json({
                message: "No authorization",
                context: "Doctor: Create patient"
            })
            return;
        }
        dbo.collection("patient").findOne({username: username}, (err, patient) => {
            if(err) throw err;
            if(patient){
                res.status(401).json({
                    message: "Username already exist",
                    context: "Doctor: Create patient"
                })
                return;
            }
            body.created_by = doctorId;
            dbo.collection('patient').insertOne(body, (err, data) => {
                if (err) throw err;
                // res.json(result);
                let medical_record ={
                    doctor_id: doctorId,
                    patient_id: data.insertedId,
                    patient: {
                        id: data.insertedId,
                        last_name: last_name,
                        first_name: first_name,
                    },
                    created_at: moment().valueOf(),
                    updated_at: moment().valueOf(),
                    created_by: {
                       id: doctorId,
                       last_name: doctor.last_name,
                       first_name: doctor.first_name,
                       speciality: doctor.speciality 
                    }
                }
                dbo.collection('medical_records').insertOne(medical_record,(err, data) =>{
                    console.log(data.insertedId);
                    res.json({
                        username,
                        password
                    });
                })
                
            });
        
        })
    })

});

router.get('/medical_records', function(req,res){
    const doctorId = req.headers["doctor-auth"];

    if(!doctorId){
        res.status(401).json({
            message: "Missing auhtentication",
            context: "Doctor: Get medical records"
        })
        return;
    }

    
    var dbo = db.get().db('eheath');
    dbo.collection("doctor").findOne({_id: new ObjectID(doctorId)}, (err, result) =>{
        if(err) throw err;
        if(!result){
            res.status(401).json({
                message: "No authorization",
                context: "Doctor: Get medical records"
            })
            return;
        }
        dbo.collection("medical_records").find({doctor_id: doctorId}).toArray((err, records) => {
            if(err) throw err;
            res.json(records);
        })
    })

});

router.get('/medical_advises', function(req,res){
    const doctorId = req.headers["doctor-auth"];

    if(!doctorId){
        res.status(401).json({
            message: "Missing auhtentication",
            context: "Doctor: Get medical advises"
        })
        return;
    }

    
    var dbo = db.get().db('eheath');
    dbo.collection("doctor").findOne({_id: new ObjectID(doctorId)}, (err, result) =>{
        if(err) throw err;
        if(!result){
            res.status(401).json({
                message: "No authorization",
                context: "Doctor: Get medical records"
            })
            return;
        }
        dbo.collection("medical_advises").find().toArray((err, advises) => {
            if(err) throw err;
            res.json(advises);
        })
    })

});
// router.get('/erase_patient', function(req,res){
//     var dbo = db.get().db('eheath');
//     dbo.collection("patient").drop(function(err, delOK) {
//         if (err) throw err;
//         if (delOK) console.log("Collection deleted");
//       });
// })

// router.get('/erase_medical', function(req,res){
//     var dbo = db.get().db('eheath');
//     dbo.collection("medical_records").drop(function(err, delOK) {
//         if (err) throw err;
//         if (delOK) console.log("Collection deleted");
//       });
// })
//Return router
module.exports = router;