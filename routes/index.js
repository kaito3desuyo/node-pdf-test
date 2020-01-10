var express = require("express");
var router = express.Router();

const pug = require("pug");
const fs = require("fs");
const pdf = require("html-pdf");

const html = fs.readFileSync(__dirname + "/template/test.html", "utf-8");
const pugToHtml = pug.renderFile(__dirname + "/template/template.pug", {
  title: "このタイトルはテスト",
  list: [
    {
      name: "肉まん",
      amount: 100
    },
    {
      name: "あんまん",
      amount: 120
    },
    {
      name: "ピザまん",
      amount: 120
    }
  ]
});

const JSZip = require("jszip");

const generatePdf = (htmlString, options) => {
  return new Promise((resolve, reject) => {
    pdf.create(htmlString, options).toBuffer((err, file) => {
      if (err) reject(err);
      resolve(file);
    });
  });
};

const generateZip = files => {
  const zip = new JSZip();
  files.forEach(file => {
    zip.file(file.name, file.buffer);
  });

  return new Promise((resolve, reject) => {
    zip.generateAsync({ type: "nodebuffer" }).then(result => {
      resolve(result);
    });
  });
};

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/preview", function(req, res, next) {
  res.send(pugToHtml);
});

router.get("/pdf", async (req, res, next) => {
  const pdf = await generatePdf(pugToHtml, {
    format: "A4",
    orientation: "landscape",
    border: {
      top: "2mm", // default is 0, units: mm, cm, in, px
      right: "1mm",
      bottom: "2mm",
      left: "1mm"
    }
  });

  const zip = await generateZip([{ name: "test.pdf", buffer: pdf }]);

  res.set("Content-Type", "application/zip");
  res.set("Content-Disposition", "attachment; filename=test.zip");
  res.send(zip);
});

module.exports = router;
