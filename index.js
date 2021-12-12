const express = require('express');
const path = require('path')
const fs = require('fs');
const url = require('url');
const app = express();
var newFiles;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (request, response) => {
  console.log("page reset...");
  fs.readFile(__dirname+"/public/index.html", 'utf8', (err, html) => {

    if(err) {
      response.status(500).send('sorry, out of order');
    }

    response.send(html);
  })
})
app.get('/graphs', (request, response) => {
  fs.readFile(__dirname+"/public/graphs.html", 'utf8', (err, html) => {

    if(err) {
      response.status(500).send('sorry, out of order');
    }

    response.send(html);
  })
})


app.get('/upload', (request, response) => {
  console.log("new upload request");
  var q = url.parse(request.url, true);
  saveChunk(q.search)
  fs.readFile(__dirname+"/public/upload.html", 'utf8', (err, html) => {

    if(err) {
      response.status(500).send('sorry, out of order');
    }
    response.send(html);
  })
})

app.listen(process.env.PORT || 3000, () => console.log('app avaiable on http://localhost:3000!'))

function saveChunk(chunk) {
  console.log("attempting to save chunk")
  newFiles = 0;
  var withoutHost = chunk.split("?d=")[1].split("&&?f=");
  var aChunk = withoutHost[0];
  var lastChunk = withoutHost[1];
  var allItems = aChunk.split("_c_");
  var item, price, sucsesses = 1;
  for(var i=0;i<allItems.length-1;i++) {
    item = allItems[i].split("_p_")[0];
    item = item.replace("%E2%9A%9A", "⚚");
    item = item.replace("%E2%9C%A6", "✦");
    item = item.replace(/_s_/g,"_");
    item = item.replace(/_a_/g,"'");
    price = allItems[i].split("_p_")[1];
    addToFile("public/logs/"+item+".txt", price, item, function() {
      sucsesses++;
    })
  }
  setTimeout(function(){console.log("sucsessfuly saved " + sucsesses + " / " + allItems.length +" files");console.log("______________")},800);
  if(lastChunk == "true" ) {
    fs.readFile(path.join(__dirname, "public/logs/meta/uploadTimes.txt"), 'utf-8', (err, data) => {
      data = Date.now()+'\n'+data;
      if(data.length == 2) {
        if(data[0]=="" && data[1] =="") {
          data=Date.now();
        }
      }
      fs.writeFileSync(path.join(__dirname, "public/logs/meta/uploadTimes.txt"), data, 'utf-8');
      console.log("written date")
    });
    console.log(newFiles+" new items found!");
    evenAllFiles();
  }


  app.use(express.static(path.join(__dirname, 'public')));
}
function evenAllFiles() {
  var correctLength,allFiles,thisFile;
  fs.readFile(path.join(__dirname, "public/logs/meta/uploadTimes.txt"), 'utf-8', (err, cData) => {
      correctLength = cData.split('\n').length;
      fs.readFile(path.join(__dirname, "public/logs/meta/tracker.txt"), 'utf-8', (err, pData) => {
        allFiles = pData.split('\n');
        for(var i=1;i<allFiles.length;i++) {
          let currentI=i;
          fs.readFile(path.join(__dirname, "public/logs/"+allFiles[i]+".txt"), 'utf-8', (err, data) => {
            thisFile = data.split('\n');
            if(thisFile.length<correctLength) {
              for(var n=0;n<correctLength-thisFile.length;n++) {
                data = "no_data"+'\n'+data;
              }
              fs.writeFileSync(path.join(__dirname, "public/logs/"+allFiles[currentI]+".txt"), data, 'utf-8');
            }
          });
        }
      })
  });
}

function addToFile(filePath,newValue,item, callback) {
  checkIfFileExists(path.join(__dirname, filePath), function(exists) {
    if(exists) {
      fs.readFile(path.join(__dirname, filePath), 'utf-8', (err, data) => {
        data = newValue+'\n'+data;
        fs.writeFileSync(path.join(__dirname, filePath), data, 'utf-8');
        callback();
      });
    } else {
      fs.appendFileSync(path.join(__dirname, filePath),newValue);
      fs.readFile(path.join(__dirname, "public/logs/meta/tracker.txt"), 'utf-8', (err,data) => {
        if(data.length==2) {
          if(data[0] == "" && data[1]=="") {
            fs.writeFileSync(path.join(__dirname, "public/logs/meta/tracker.txt"), "item", 'utf-8');
          } else {
            fs.appendFileSync(path.join(__dirname, "public/logs/meta/tracker.txt"),'\n'+item);
          }
        } else {
          fs.appendFileSync(path.join(__dirname, "public/logs/meta/tracker.txt"),'\n'+item);
        }
        newFiles++;
        callback();
      });
    }
  });
}

function writeCreateFile(filePath, newValue, callback) {
  checkIfFileExists(path.join(__dirname, filePath), function(exists) {
    if(exists){
      fs.writeFileSync(path.join(__dirname, filePath), newValue, 'utf-8')
    } else {
      fs.appendFileSync(path.join(__dirname, filePath),newValue);
    }
    callback();
  })

}

function checkIfFileExists(filePath, callback) {
  fs.readFile(filePath, 'utf-8', function(err, data) {
   callback(data != undefined);
 });
}
