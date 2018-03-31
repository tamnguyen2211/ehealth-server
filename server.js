import express from 'express';
import body_parser from 'body-parser';

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

app.post('/medical-record', (req, res) => {
    const medical_record = req.body;

    mongo_client.connect(uri, (err, db) => {
        if (err) throw err;

        const dbo = db.db('eheath');
        dbo.collection('medical-records').insertOne(medical_record, (err, data) => {
            db.close();

            if (err) throw err;

            res.json(data);
        });
    });
});

app.listen(4000, () => {
    console.log('Stock Analysis API Running on port 4000');
});
