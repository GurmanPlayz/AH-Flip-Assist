var settings = {
  toggle: function(e) {
    var settings = document.getElementById("settings");
    if(settings.style.display == "block") {
      settings.style.display = "none";
    } else {
      settings.style.display = "block";
    }
  },
  updateBudget: function(e) {
    if(!isNaN(Number(e.value) && !e.value == null)) localStorage.budget = e.value;
  },
  updateRisk: function(e) {
    if(!isNaN(Number(e.value) && !e.value == null)) localStorage.risk = e.value;
  }
}

var UI = {
  tableRows:200,
  createTable: function() {
    var newRow,table = document.getElementById("flipTable");

    document.getElementById("status").classList.remove("statusBig");
    document.getElementById("status").classList.add("statusSmall");
    table.innerHTML = "";
    var loopLength = this.tableRows;
    if(loopLength>flips.allProfitability.length) loopLength = flips.allProfitability;

    for(var i=0;i<loopLength;i++) {
      let index = i;
      this.createGraphLink(flips.allProfitability[index].item, function(canAppend){
        console.log(canAppend);
        if(canAppend) {
          newRow = document.createElement("tr");

          newRow.title="click to copy view auction command";
          newRow.appendChild(UI.createGraphLink(flips.allProfitability[index].item));
          newRow.appendChild(UI.newCol(flips.allProfitability[index].item.item_name, index));
          newRow.appendChild(UI.newCol(flips.allProfitability[index].item.tier, index));
          newRow.appendChild(UI.newCol(UI.cleanUpNumbers(flips.allProfitability[index].potentialProfit), index));
          newRow.appendChild(UI.newCol(UI.cleanUpNumbers(flips.allProfitability[index].currentProfit), index));
          newRow.appendChild(UI.newCol(UI.roundPer(flips.allProfitability[index].currentPer), index));
          newRow.appendChild(UI.newCol(UI.roundPer(flips.allProfitability[index].potentialPer), index));

          table.appendChild(newRow);
        } else {
          i--;
        }
      });
    }
  },
  createGraphLink: function(profit, cb) {
    var newE = document.createElement("th");
    var a = document.createElement("a");

    var fileName=flips.getFileName(profit)
    graphMath.checkVolitility(fileName, function(volitility) {
      if(volitility>10) {
        if(volitility>userInfo.removeVolitile) {
          if(cb!=undefined)cb(false);
        } else {
          if(cb!=undefined) cb(true)
        }
        newE.classList.add("fa");
        newE.classList.add("fa-exclamation-circle");
        var color = (100+(((volitility-10)/40)*100))
        if(color>220)color=220;
        newE.style.color = "rgb("+color+", 0, 0)";
        newE.style.fontSize = "0.8cm";
        a.title = "(!!Volitile Market!!) click to see price graphs";
      } else {
        if(cb!=undefined) cb(true)
        newE.style.fontSize = "0.6cm";
        newE.innerHTML = "&#9432;";
        newE.style.color="black";
        a.title = "click to see price graphs";
      }
    })
    a.href = "graphs?q="+fileName;
    a.appendChild(newE);

    a.classList.add("infoIcon");
    a.target = "_blank"

    return a;
  },
  newCol: function(html,index) {
    var col = document.createElement('th');
    col.innerHTML = html;
    col.id="item"+index
    let shownProfit = flips.allProfitability;
    col.onclick = function() {UI.copyToClipboard("/viewauction "+shownProfit[Number(this.id.split("item")[1])].item.uuid)};
    return col;
  },
  updateStatus: function() {
    document.getElementById("status").innerHTML = graphMeta.status;
  },
  copyToClipboard: function(text) {
   const elem = document.createElement('textarea');
   elem.value = text;
   document.body.appendChild(elem);
   elem.select();
   document.execCommand('copy');
   document.body.removeChild(elem);
 },
 cleanUpNumbers: function(number) {
   if(typeof number == "string") return number;
   var split=number.toString().split('');
   var n=0;
   for(var i=split.length-1;i>=1;i--) {
     if(n%3==2 && split[i-1] != "-") split.splice(i, 0, "," );
     n++;
   }
   return split.join('');
 },
 roundPer: function(val) {
   if(typeof val == "string") return val;
   val*=100;
   return Math.round(val)+"%";
 }
}


var flips = {
  allProfitability:[],
  currentItemCycle:0,
  currentItemIndex:0,
  sortArrayProp: undefined,
  findSingleFlip: function(item, fileName, callback) {
    checkIfFileExists(fileName,function(exists) {
      if(item.starting_bid <= userInfo.budget && exists) {
        serverReq(fileName+".txt", function(priceHistory) {
          var recentPrice = flips.getAV(priceHistory,timeChecker.itemTicks);
          var commonName = fileName.replace(/_/g, " ");
          var lowestBin = AHData.sortCataIBin[AHData.sortCataCBin.indexOf(commonName)][0].starting_bid == item.starting_bid;
          var currentCompareItem = AHData.sortCataIBin[AHData.sortCataCBin.indexOf(commonName)][0];
          if(lowestBin) {
            if(AHData.sortCataIBin[AHData.sortCataCBin.indexOf(commonName)].length != 1) {
              currentCompareItem = AHData.sortCataIBin[AHData.sortCataCBin.indexOf(commonName)][1];
            }
          }
          var profitObj = {
            item:item,
            potentialProfit:Math.round(recentPrice-item.starting_bid),
            currentProfit:Math.round(currentCompareItem.starting_bid-item.starting_bid),
            potentialPer:(1-(item.starting_bid/recentPrice))*-1,
            currentPer:(1-(item.starting_bid/currentCompareItem.starting_bid))*-1,
            lowestBin:lowestBin
          }
          if(lowestBin && AHData.sortCataIBin[AHData.sortCataCBin.indexOf(commonName)].length == 1) {
            profitObj.currentProfit = "only one on AH";
            profitObj.currentPer = "only one on AH";
          }
          callback(profitObj);
        });
      } else {
        callback(false);
      }
    });
  },
  searchAllFlips: function(callback) {
    var thisItem = AHData.sortCataIBin[flips.currentItemCycle][flips.currentItemIndex];
    this.findSingleFlip(thisItem,this.getFileName(thisItem), function(profit) {

      var nextItem = true;
      if(profit != false) {
        flips.allProfitability.push(profit);
      } else {
        nextItem = false;
      }
      if(profit.potentialProfit>=0 && profit.currentProfit>=0) nextItem = false;
      if(nextItem || flips.currentItemIndex>=AHData.sortCataIBin[flips.currentItemCycle].length-1) {
        flips.currentItemCycle++
        flips.currentItemIndex=0;
      } else {
        flips.currentItemIndex++;
      }
      if(flips.currentItemCycle<AHData.sortCataCBin.length) {
        graphMeta.status = "finding best flips " + flips.currentItemCycle + "/"+AHData.sortCataCBin.length
        if(flips.currentItemIndex==0) {
          UI.updateStatus();
        }
        flips.searchAllFlips(callback);
      } else {
        flips.sortByProfit();
        callback();
      }
    });
  },
  getFileName: function(item) {
    var str = item.item_name;
    var starred = str.includes("✪");
    str = str.replace(/✪/g, "");
    str = str.replace("_", "-");
    str = str.replace("/", "+");
    str = build.removeReforge(str);
    str = str.replace(/ /g, "_");
    if(starred) {
      if(str.charAt(str.length-1) != "✦") {
        str = str.slice(0, -1)
      } else {
        str = str.split('')
        str.splice(str.length-2,1)
        str = str.join('');
      }
    }
    return "("+item.tier+")_"+str;
  },
  getAV: function(array,timeBack) {
    var sum = 0,averager=0;
    for(var i=0;i<timeBack;i++) {
      if(array[i] != "no_data") {
        sum+=Number(array[i]);
      } else {
        averager--;
      }

    }
    return sum/(timeBack+averager);
  },
  sortByProfit: function() {
    flips.sortArrayProp="potentialProfit"; // change how items are sorted
    flips.allProfitability.sort(function(a,b){return b[flips.sortArrayProp]-a[flips.sortArrayProp]});
  }
}

var timeChecker = {
  itemTicks:0,
  timeToUploads: function() {
    serverReq("meta/uploadTimes.txt", function(uploadTimes) {
      var currentTime = 0;
      for(var i=1;i<uploadTimes.length;i++) {
        if(i<uploadTimes.length-1) {
          currentTime+=Number(uploadTimes[i-1])-Number(uploadTimes[i]);
        }
        if(currentTime<=(userInfo.risk*1000)) {
          timeChecker.itemTicks=i+1;
        }
      }
      if(timeChecker.itemTicks ==0) {
        timeChecker.itemTicks=uploadTimes.length-1;
      }
    });
  }
}

function serverReq(file,callback) {
	var txtFile = new XMLHttpRequest();
	txtFile.open("GET", "/logs/"+file, true);
	txtFile.onreadystatechange = function() {
  		if (txtFile.readyState === 4) {
    		if (txtFile.status === 200) {
     			allText = txtFile.responseText;
      	  lines = txtFile.responseText.split("\n");
      	  callback(lines)
    		} else if(txtFile.status == 404) {
          callback("404");
          return;
        }

  		}
	}
  txtFile.send(null)
}

function checkIfFileExists(filePath,callback) {
  serverReq("meta/tracker.txt", function(data) {
    var hasMatch = false
    for(var i=1;i<data.length;i++) {
      if(data[i]==filePath) hasMatch = true;
    }
    callback(hasMatch);
  });
}
