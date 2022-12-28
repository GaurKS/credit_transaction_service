const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');
const multer = require("multer");
const { 
  uploadCSV, 
  pingTest,
  uploadCSVToCloud
} = require('../controllers/app.controllers');


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fpath = path.join(process.cwd(), 'uploads');
    fs.mkdirSync(fpath, {recursive: true});
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get('/ping/test', pingTest);
router.post('/local/upload/csv', upload.single('csv'), uploadCSV);
router.post('/cloud/upload/csv', upload.single('csv'), uploadCSVToCloud);

module.exports = router;
