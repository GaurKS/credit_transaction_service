const fs = require('fs');
const csv = require('csv-parser');
const iconv = require('iconv-lite');
const json2csv = require('json2csv').parse;
const path = require('path');
const admin = require('firebase-admin');

/**
 * Setting-up firebase cloud service 
 */ 
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.GCS_STORAGE_URL
});
const bucket = admin.storage().bucket();

/**
 * service to test the status of endpoints
 */
const pingTest = (req, res) => {
  return res.status(200).json({
    msg: 'success',
    data: 'Server is up and running ...🚀🚀'
  });
};

/**
 * service to create credit transactions and to generate
 * local csv output file with results
 */
const uploadCSV = async(req, res) => {
  const results = {};
  try {
    const filePath = req.file.path;
    fs.createReadStream(filePath)
    .pipe(iconv.decodeStream('utf8'))
    .pipe(csv(['id', 'date', 'amt'], {separator: '\n'}))
    .on('data', (row) => {
      // console.log(row);

      if ( String(row.id).length != 0 ){
        const month = row.date.split('/')[0];
        const year = row.date.split('/')[2];
        const dateKey = String(month+'/'+year);
        const key = String(row.id+'^'+dateKey);

        if ( !results[key] ){
          results[key] = {
            min: Number.MAX_VALUE,
            max: -Number.MAX_VALUE,
            month: key.split('^')[1],
            currBalance: 0
          }
        }

        // Update the customer's balance for the month
        results[key].currBalance += parseInt(row.amt);
        results[key].min = Math.min(results[key].min, results[key].currBalance);
        results[key].max = Math.max(results[key].max, results[key].currBalance);
      }
    })
    .on('end', ()=> {
      console.log('CSV file successfully processed');
      console.log("results: ", results);

      // generating csv output file with calculated transactions
      const data = Object.entries(results).map(
        ([key, value]) => ({
          customerId: key.split('^')[0],
          month: value.month,
          minBalance: value.min,
          maxBalance: value.max,
          endingBalance: value.currBalance
        })
      );
      const csv = json2csv(data, {header: false});

      const csvFileName = `${Date.now().toString()}.csv`;
      const completeFilePath = path.join(process.cwd(), 'outputs');
      fs.mkdirSync(completeFilePath, { recursive: true });
      fs.writeFileSync(path.join(completeFilePath, csvFileName), csv, function (err) {
        if (err) throw err;
        console.log('file saved: ', csvFileName);
      })

      return res.status(200).json({
        statusCode: 201,
        outputFileName: csvFileName,
        result: results
      });
    })
  } catch (error) {
    console.log("error", err);
    return res.status(400).json({
      statusCode: 400,
      msg: 'Error',
      data: err
    });
  }
};

/**
 * service to create credit transactions and to generate
 * and store csv output file with results on firebase cloud storage
 */
const uploadCSVToCloud = async(req, res) => {
  const results = {}; // to store processed credit transaction
  const url = []; // to store download url from firebase storage
  const csvFileName = `${Date.now().toString()}.csv`;
  try {
    const filePath = req.file.path;
    fs.createReadStream(filePath)
    .pipe(iconv.decodeStream('utf8'))
    .pipe(csv(['id', 'date', 'amt'], {separator: '\n'}))
    .on('data', async(row) => {
      // console.log(row);

      if ( String(row.id).length != 0 ){
        const month = row.date.split('/')[0];
        const year = row.date.split('/')[2];
        const dateKey = String(month+'/'+year);
        const key = String(row.id+'^'+dateKey);

        if ( !results[key] ){
          results[key] = {
            min: Number.MAX_VALUE,
            max: -Number.MAX_VALUE,
            month: key.split('^')[1],
            currBalance: 0
          }
        }

        // Update the customer's balance for the month
        results[key].currBalance += parseInt(row.amt);
        results[key].min = Math.min(results[key].min, results[key].currBalance);
        results[key].max = Math.max(results[key].max, results[key].currBalance);
      }
    })
    .on('end', async()=> {
      console.log('CSV file successfully processed');
      console.log("results: ", results);

      // generating csv output file with calculated transactions
      const data = Object.entries(results).map(
        ([key, value]) => ({
          customerId: key.split('^')[0],
          month: value.month,
          minBalance: value.min,
          maxBalance: value.max,
          endingBalance: value.currBalance
        })
      );
      const csv = json2csv(data, {header: false});

      // csvFileName = `${Date.now().toString()}.csv`;
      const completeFilePath = path.join(process.cwd(), 'outputs');
      fs.mkdirSync(completeFilePath, { recursive: true });
      fs.writeFileSync(path.join(completeFilePath, csvFileName), csv, function (err) {
        if (err) throw err;
        console.log('file saved: ', csvFileName);
      })

      // Saving generated csv file to firebase cloud storage
      const file = bucket.file(csvFileName);
      const accessToken = String(Date.now());
      const buffer = Buffer.from(csv);

      const options = {
        action: 'read',
        expires: '03-09-2491'
      };

      console.log("Uploading ...");
      await file.save(buffer, {
        metadata: {
          contentType: 'text/csv',
          metadata: {
            firebaseStorageDownloadTokens: accessToken
          }
        },
        resumable: false
      })
      const [uri] = await file.getSignedUrl(options);
      url.push(uri);
      console.log("File uploaded successfully: ", uri);
      return res.status(201).json({
        statusCode: 201,
        outputFileName: csvFileName,
        url: url[0],
      });
    })
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({
      statusCode: 400,
      msg: 'Error',
      data: error
    });
  }
};

module.exports = {
  pingTest, 
  uploadCSV,
  uploadCSVToCloud
}