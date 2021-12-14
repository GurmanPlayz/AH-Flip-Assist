var reqMeta = {
  totalPages:undefined,
  currentPage:0,
  stopReqs:false,
  reqTime: undefined
}

var graphMeta = {
  status:"",
  reqTime: []
}
var AHData = {
  allReforges: ["Gentle", "Odd", "Fast", "Fair", "Epic", "Sharp", "Heroic", "Spicy", "Legendary", "Deadly", "Fine", "Grand", "Hasty", "Neat", "Rapid", "Unreal", "Awkward", "Rich", "Clean", "Fierce", "Heavy", "Light", "Mythic", "Pure", "Smart", "Titanic", "Wise", "Candied", "Bizarre", "Itchy", "Ominous", "Pleasant", "Pretty",
                "Shiny", "Simple", "Strange", "Vivid", "Godly", "Demonic", "Forceful", "Hurtful", "Keen", "Strong", "Superior", "Unpleasant", "Zealous", "Moil", "Toil", "Blessed", "Bountiful", "Magnetic", "Fruitful", "Refined", "Stellar", "Mithraic", "Auspicious", "Fleet", "Heated", "Ambered", "Dirty", "Fabled",
                "Suspicious", "Gilded", "Warped", "Withered", "Bulky", "Salty", "Treacherous", "Stiff", "Lucky", "Precise", "Spiritual", "Headstrong", "Perfect", "Necrotic", "Ancient", "Spiked", "Renowned", "Cubic", "Reinforced", "Loving", "Ridiculous", "Empowered", "Giant", "Submerged", "Jaded", "Silky", "Bloody",
                "Shaded", "Sweet", "Undead"],
  allData: [],
  sortData:[],
  sortCataCBin:[],
  sortCataIBin:[]
}

var userInfo = {
  budget: undefined,
  risk: undefined
}

window.onload = function() {
  timeChecker.timeToUploads();
  checkLocalStorage();
  createCallBackLoader();

}

function checkLocalStorage() {
  var lsBudget = localStorage.budget;
  if(!lsBudget || lsBudget == "") {
    localStorage.budget = 100000;
    lsBudget = localStorage.budget;
  }
  document.getElementById("budgetInput").value = lsBudget;
  userInfo.budget = Number(lsBudget);

  var lsRisk = localStorage.risk;
  if(!lsRisk || lsRisk == "") {
    localStorage.risk = 168;
    lsRisk = localStorage.risk;
  }
  document.getElementById("riskInput").value = lsRisk;
  userInfo.risk = Number(lsRisk)*3600;
}



function getAllAHData(callback) {
  var dStart;
  var timeoutLoop = setTimeout(function() {
    dStart = new Date().getTime();
    requestItemChunk(reqMeta.currentPage,function(data) {

      reqMeta.reqTime = new Date().getTime() - dStart;
      graphMeta.reqTime.push(reqMeta.reqTime);
      graphHandler.reqTime();
      if(data.success){
        AHData.allData.push(data.auctions);

        graphMeta.status = "sorting AH page "+(data.page+1) + "/"+reqMeta.totalPages;
        UI.updateStatus()

        reqMeta.currentPage++;
        sortAuctions.sortIntoCata(function() {
          if(reqMeta.currentPage>=reqMeta.totalPages) {
            reqMeta.currentPage=0;
            callback();
          } else {
            getAllAHData(callback);

          }
        });

      } else if(data.succsess != false) {
        getAllAHData(callback);
      }
    })
  }, 100);
}

function createCallBackLoader() {
  var uploadCounter = 10,uploadLoop;
  setDefaults();
  getAllAHData(function() {
    graphMeta.status = "sorting by price...";
    UI.updateStatus();
    setTimeout(function() {
      sortAuctions.sortAllByPrice(function() {
        flips.searchAllFlips(function() {
          graphMeta.status = "best flips found";
          UI.updateStatus();
          UI.createTable();
          if(flips.allProfitability.length==0)uploadCounter=0;
          checkIfCanUpload(function(canUpload) {
            if(canUpload) {
              uploadLoop = window.setInterval(function() {
                uploadCounter--;
                graphMeta.status = "uploading all data in "+uploadCounter+" secconds."
                UI.updateStatus();
                if(uploadCounter<0) {
                  clearInterval(uploadLoop);
                  upload.uploadAllData(function() {
                    graphMeta.status = "all data uploaded";
                    UI.updateStatus()
                    if(flips.allProfitability.length==0 && AHData.sortCataCBin.length !=0)location.reload();
                    if(!reqMeta.stopReqs) {
                      createCallBackLoader();
                    }
                  });
                }
              },1000);
            } else {
              if(!reqMeta.stopReqs) {
                createCallBackLoader();
              }
            }
          })
        });
      });
    },1000)

  })
}

function checkIfCanUpload(callback) {
  serverReq("meta/uploadTimes.txt", function(data) {
    if(AHData.sortCataCBin.length==0) {
      callback(false)
    } else if(data[0] == '') {
      callback(true)
    } else {
      var mostRecentUpload = data[0];
      var date = new Date();
      var time = date.getTime();
      var timeDif = time-mostRecentUpload;
      callback(timeDif>=600000);
    };
  });
}


function setDefaults() {
  AHData.allData=[];
  AHData.sortData=[];
  AHData.sortCataCBin=[];
  AHData.sortCataIBin=[];
  build.currentChunkIndex=0;
  reqMeta.currentPage=0;
  flips.currentItemCycle=0;
  flips.currentItemIndex=0;
  flips.allProfitability = [];
}



function requestItemChunk(startPage, callBack) {
  fetch("https://api.hypixel.net/skyblock/auctions?page="+startPage)
      .then(response => {
        return response.json()
      })
      .catch(error => {
        graphMeta.status = "Netowrk Error "+error
        UI.updateStatus()
        return "error"
      })
      .then(data => {
          reqMeta.totalPages = data.totalPages;
          callBack(data);
      })

}

var sortAuctions = {
  sortArrayProp:undefined,

  sortIntoCata: function(callback) {
    var thisItem, indexOf;
    for(var i=0;i<AHData.allData[0].length;i++) {
      thisItem = AHData.allData[0][i];
      if(!thisItem.item_name.includes("[")) {
        if(thisItem.bin) {

          if(!AHData.sortCataCBin.includes("("+build.removeUnderScores(thisItem.tier)+") "+build.removeSpecialChars(thisItem.item_name))) {
            AHData.sortCataCBin.push("("+build.removeUnderScores(thisItem.tier)+") "+build.removeSpecialChars(thisItem.item_name));
            AHData.sortCataIBin.push([]);
          }
          indexOf = AHData.sortCataCBin.indexOf("("+build.removeUnderScores(thisItem.tier)+") "+build.removeSpecialChars(thisItem.item_name));
          AHData.sortCataIBin[indexOf].push(thisItem);
          AHData.sortData.push(thisItem);
        }
      }
    }
    AHData.allData.splice(0,1);
    callback();
  },
  sortAllByPrice: function(callback) {
    var thisCata;
    for(var i=0;i<AHData.sortCataIBin.length;i++) {
      thisCata = AHData.sortCataIBin[i];
      sortAuctions.sortByPrice(thisCata);
    }
    callback();
  },
  sortByPrice: function(item) {
    sortAuctions.sortArrayProp="starting_bid";
    item.sort(function(a,b){return a[sortAuctions.sortArrayProp]-b[sortAuctions.sortArrayProp]});
  }
}

var upload = {
  uploadAllData: function(callback) {
    build.buildUploadURLChunk(function(data) {
      if(build.currentChunkIndex>=AHData.sortCataCBin.length-1) {
        window.open("/upload?d="+data+"&&?f=true", '_blank');
      } else {
        window.open("/upload?d="+data+"&&?f=false", '_blank');
      }

      window.setTimeout(function() {
        if(build.currentChunkIndex<=AHData.sortCataCBin.length-1) {
          upload.uploadAllData(callback);
        } else {
          callback();
        }
      },1500);
    })
  }
}

var build = {
  currentChunkIndex:0,
  nextChunkSize:undefined,
  buildUploadURLChunk: function(callback) {
    var built = "";
    var chunkSize = AHData.sortCataCBin.length-this.currentChunkIndex;
    if(chunkSize>150) chunkSize = 150;
    for(var i=this.currentChunkIndex;i<chunkSize+this.currentChunkIndex;i++) {
      built+=this.removeAp(this.removeSpace(AHData.sortCataCBin[i]));
      built+="_p_";
      built+=AHData.sortCataIBin[i][0].starting_bid;
      built+="_c_";
    }
    this.currentChunkIndex+=chunkSize;
    this.nextChunkSize = AHData.sortCataCBin.length-this.currentChunkIndex;
    if(this.nextChunkSize>150) this.nextChunkSize = 150;
    callback(built);
  },
  removeSpace: function(str) {
    return str.replace(/ /g,"_s_");
  },
  removeAp: function(str) {
    return str.replace(/'/g, "_a_");
  },
  removeUnderScores: function(str) {
    str = str.replace("_", "-");
    return str;
  },
  removeSpecialChars: function(str) {
    var starred = str.includes("✪");
    str = str.replace(/✪/g, "");
    str = str.replace("/", "+");
    this.removeUnderScores(str);
    str = this.removeReforge(str);
    if(starred) {
      if(str.charAt(str.length-1) != "✦") {
        str = str.slice(0, -1)
      } else {
        str = str.split('')
        str.splice(str.length-2,1)
        str=str.join('');
      }
    }
    return str;
  },
  removeReforge: function(str) {
    var newStr;
    if(str.includes('Very ') || str.includes("Absolutly ") || str.includes("Even More ") && !str.includes('Very Special')) {
      if(str.includes('Very ')) {
        newStr = str.split("Very ")[1];
      } else if(str.includes("Absolutly ")){
        newStr = str.split("Absolutly ")[1];
      } else {
        newStr = str.split("Even More ")[1]
      }
    } else {
      var reforge = this.checkAllReforges(str);
      if(reforge != false) {
        newStr = str.replace(reforge+" ", "")
      } else {
        newStr = str;
      }
    }
    return newStr;
  },
  checkAllReforges: function(str) {
    for(var i=0;i<AHData.allReforges.length;i++) {
      if(str.includes(AHData.allReforges[i]+" ")) {
        if(this.checkContra(str, AHData.allReforges[i]))  return AHData.allReforges[i];
      }
    }
    return false;
  },
  checkContra: function(str, ref) {
    if(str.includes("Wise Dragon") && ref == "Wise") {
      return false;
    }
    if(str.includes("Suspicious Vial") && ref == "Suspicious") {
      return false;
    }
    if(str.includes("Strong Dragon") && ref == "Strong") {
      return false;
    }
    if(str.includes("Perfect Chestplate") && ref == "Perfect") {
      return false;
    }
    if(str.includes("Superior Dragon") && ref == "Superior") {
      return false;
    }
    if(str.includes("Perfect Leggings") && ref == "Perfect") {
      return false;
    }
    if(str.includes("Perfect Helmet") && ref == "Perfect") {
      return false;
    }
    if(str.includes("Perfect Boots") && ref == "Perfect") {
      return false;
    }
    if(str.includes("Super Heavy") && ref == "Heavy") {
      return false;
    }
    if(str.includes("Heavy Helmet") && ref == "Heavy") {
      return false;
    }
    if(str.includes("Heavy Chestplate") && ref == "Heavy") {
      return false;
    }
    if(str.includes("Heavy Leggings") && ref == "Heavy") {
      return false;
    }
    if(str.includes("Heavy Boots") && ref == "Heavy") {
      return false;
    }
    if(str.includes("Refined Titanium Pickaxe") && ref == "Refined") {
      return false;
    }
    return true;
  }
}
var graphHandler = {
  reqTime: function() {
    if(graphMeta.reqTime.length>150) {
      graphMeta.reqTime.splice(0,1);
    }
  }
}
