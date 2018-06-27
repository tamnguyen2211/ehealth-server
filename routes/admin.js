var express = require('express');
var router = express.Router();
var request  = require('request');
var db = require('../db')
var ObjectID = require('mongodb').ObjectID;
var _ = require("underscore");

// get all medical record
router.get('/', function(req,res){
    const adminId = req.headers["admin-auth"];

    if(!adminId){
        res.status(401).json({
            message: "Missing auhtentication",
            context: "Admin: Get admin detail"
        })
        return;
    }

    var dbo = db.get().db('eheath');
    dbo.collection("admin").findOne({_id: new ObjectID(adminId)}, (err, result) =>{
        if(err) throw err;
        if(!result){
            res.status(401).json({
                message: "No authorization",
                context: "Admin: Get admin detail"
            })
            return;
        }
        result.role="admin"
        res.json(_.omit(result, 'password'));

    })
});

//insert medical record
router.post('/create_doctor', function(req,res){
	const adminId = req.headers["admin-auth"];

    if(!adminId){
        res.status(401).json({
            message: "Missing auhtentication",
            context: "Admin: Create doctor"
        })
        return;
    }

    const body = req.body;
    if(!body){
        res.status(400).json({
            message: "Missing body",
            context: "Admin: Create doctor"
        })
        return;
    }

    let { first_name, last_name, username, hospital, speciality, tel, mail, address, note, password } = body;

    if(!first_name){
        res.status(400).json({
            message: "Missing doctor first name",
            context: "Admin: Create doctor"
        })
        return;
    }

    if(!last_name){
        res.status(400).json({
            message: "Missing doctor last name",
            context: "Admin: Create doctor"
        })
        return;
    }

    if(!username){
        res.status(400).json({
            message: "Missing doctor username",
            context: "Admin: Create doctor"
        })
        return;
    }

    if(!tel){
        res.status(400).json({
            message: "Missing doctor telephone",
            context: "Admin: Create doctor"
        })
        return;
    }

    if(!password){
        res.status(400).json({
            message: "Missing password",
            context: "Admin: Create doctor"
        })
        return;
    }

    if(!address){
        res.status(400).json({
            message: "Missing address",
            context: "Admin: Create doctor"
        })
        return;
    }

    if(!mail){
        res.status(400).json({
            message: "Missing mail",
            context: "Admin: Create doctor"
        })
        return;
    }

	var dbo = db.get().db('eheath');
    dbo.collection("admin").findOne({_id: new ObjectID(adminId)}, (err, result) =>{
        if(err) throw err;
        if(!result){
            res.status(401).json({
                message: "No authorization",
                context: "Admin: Create doctor"
            })
            return;
        }
        dbo.collection("doctor").findOne({username: username}, (err, doctor) => {
            if(err) throw err;
            if(doctor){
                res.status(401).json({
                    message: "Username already exist",
                    context: "Admin: Create doctor"
                })
                return;
            }
            dbo.collection('doctor').insertOne(body, (err, data) => {
                if (err) throw err;
                // res.json(result);
                res.json({
                    username,
                    password
                });
            });
        
        })
    })

});

router.post('/signin', function(req, res){
    const id = req.params.id;
    let body = req.body;
    if(!body){
        res.status(400).json({
            message: "Missing body",
            context: "Admin: Sign in"
        })
        return;
    }

    let { username, password } = body;
    if(!username){
        res.status(400).json({
            message: "Missing username",
            context: "Admin: Sign in"
        })
        return;
    }

    if(!password){
        res.status(400).json({
            message: "Missing password",
            context: "Admin: Sign in"
        })
        return;
    }
    let dbo = db.get().db('eheath');

    let myquery = {
        username: username
    }
    dbo.collection("admin").findOne(myquery, (err, result) =>{
        if (err) throw err;
        if(!result){
            res.status(404).json({
                message: "Username not exist",
                context: "Admin: Sign in"
            })
            return;
        }
        if(result.password != password){
            res.status(401).json({
                message: "Password incorrect",
                context: "Admin: Sign in"
            })
            return;
        }

        _.omit(result, 'password')
        res.json(result);

    });
})
//Return router
module.exports = router;