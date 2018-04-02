import express from 'express';
import body_parser from 'body-parser';
import * as db from './db';
const mongo_client = require('mongodb').MongoClient;
const uri = `mongodb://phongnguyen:P%40ssw0rd@ds231199.mlab.com:31199/eheath`;
const app = express();

app.use(body_parser.json());

app.get('/', (req, res) => {
    res.json({
        name: 'e-health api',
        version: '1.0.1'
    });
});

// app.post('/medical-record', (req, res) => {
//     const medical_record = req.body;

//     mongo_client.connect(uri, (err, db) => {
//         if (err) throw err;

//         const dbo = db.db('eheath');
//         dbo.collection('medical-records').insertOne(medical_record, (err, data) => {
//             db.close();

//             if (err) throw err;

//             res.json(data);
//         });
//     });
// });


db.connect(uri, function (err) {
  if (err) {
    console.error(err);
    console.log('Unable to connect to MongoDB.');
    process.exit(1);
  } else{
    console.log("Database connection ready");
    // Initialize the app.
    app.listen(process.env.PORT || 4000, () => {
        console.log('Stock Analysis API Running on port 4000');
    });
  }

  // Save database object from the callback for reuse.
  
});

app.use('/medical_record', require('./routes/medical_record'));

// app.listen(process.env.PORT || 4000, () => {
//     console.log('Stock Analysis API Running on port 4000');
// });
