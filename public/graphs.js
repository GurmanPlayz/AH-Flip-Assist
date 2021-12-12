
var graphs = {
  currentGraphData:undefined,
  markerIndicators:undefined,
  getGraphData:function(item, callback) {
    serverReq("meta/uploadTimes.txt", function(times) {
      serverReq(item+".txt", function(data) {
        graphs.currentGraphData = [];
        var thisEntry;
        var date = new Date();
        var thisTime = date.getTime();
        for(var i=0;i<data.length;i++) {
          thisEntry = data[i];
          if(!isNaN(Number(thisEntry))) thisEntry = Number(thisEntry);
          if(thisTime-times[i]<=time[time.currentSelected] || time.currentSelected == "all") {
            graphs.currentGraphData.push({data:thisEntry,uploadTime: Number(times[i]),time:thisTime-times[i]});
          }
        }
        if(graphs.checkContainesData(graphs.currentGraphData)) {
          graphs.writeGraph(callback);
        } else {
          var currentTimeIncrement = time.incrementor.indexOf(time.currentSelected);
          time.currentSelected = time.incrementor[currentTimeIncrement+1];
          localStorage.graphScale = time.currentSelected;
          document.getElementById("timeDropLabel").innerHTML = time.currentSelected;
          graphs.getGraphData(item, callback);
        }
      });
    });
  },

  checkContainesData: function(array) {
    for(var i=0;i<array.length;i++) {
      if(array[i].data != "no_data") return true;
    }
    return false;
  },

  writeGraph: function(callback) {
    var canvas = document.getElementById("canvas");
    var c = canvas.getContext("2d");
    canvas.width = window.innerWidth*0.8;
    canvas.height = canvas.width*(1/2);

    var data = graphs.currentGraphData;
    var sortedTimeMin=data.slice();
    sortedTimeMin.sort(function(a,b){return a.uploadTime-b.uploadTime});
    var spreadX= sortedTimeMin[sortedTimeMin.length-1].uploadTime-sortedTimeMin[0].uploadTime;
    graphs.markerIndicators = []

    var sortedByPrice = this.removeNoData(data.slice());
    sortedByPrice.sort(function(a,b){return b["data"]-a["data"]});
    var sortedByMin = this.removeNoData(data.slice());
    sortedByMin.sort(function(a,b){return a["data"]-b["data"]});
    var spreadY=sortedByPrice[0].data-sortedByMin[0].data;
    var currentX,currentY;
    c.beginPath();
    c.lineWidth=4;
    c.lineCap="square";
    var withoutNoData = this.removeNoData(data.slice());
    for(var i=0;i<data.length;i++) {
      currentX = (((data[i].uploadTime - sortedTimeMin[0].uploadTime)/spreadX))*canvas.width;
      c.beginPath();
      c.moveTo(currentX,0);
      if(data[i].data != "no_data") {
        c.strokeStyle="rgba(100,100,100,0.2)";
      } else {
        c.strokeStyle="rgb(150,0,0,0.2)";
      }
      c.lineTo(currentX,canvas.height);
      c.stroke();
    }

    c.lineWidth=3;
    c.beginPath();
    c.strokeStyle="rgb(80,80,200)"
    currentY = ((1-((withoutNoData[0].data-sortedByMin[0].data)/spreadY))*(canvas.height*0.9))+canvas.height*0.1;
    for(var i=0;i<data.length;i++) {
      currentX = (((data[i].uploadTime - sortedTimeMin[0].uploadTime)/spreadX))*canvas.width;
      if(data[i].data != "no_data") {
        currentY = ((1-((data[i].data-sortedByMin[0].data)/spreadY))*(canvas.height*0.8))+canvas.height*0.1;
        graphs.markerIndicators.push({position:currentX,dataPoint:data[i],currentY:currentY});
      } else {
        graphs.markerIndicators.push({position:currentX,dataPoint:data[i],currentY:currentY});
      }
      c.lineTo(currentX,currentY);
    }
    c.stroke();
    callback();
  },
  removeNoData: function(array) {
    var newArray = array.slice();
    for(var i=0;i<newArray.length;i++) {
      if(newArray[i].data == "no_data") {
        newArray.splice(i,1);
        i--;
      }
    }
    return newArray;
  },
  cleanUpDate: function(ms) {
    var time,unit;
    if(ms>=31104000000)  {
      time=Math.round(ms/31104000000);
      unit="year";
    } else if(ms>=2678400000) {
      time = Math.round(ms/2678400000);
      unit="month";
    } else if(ms>=604800000) {
      time = Math.round(ms/604800000);
      unit="week";
    } else if(ms>=86400000) {
      time = Math.round(ms/86400000);
      unit="day";
    } else if(ms>=3600000) {
      time = Math.round(ms/3600000);
      unit="hour";
    } else {
      time = Math.round(ms/60000);
      unit="minute";
    }
    if(time>1) unit+="s"
    return {unit:unit, time:time};
  }
}
window.onload = function() {

  if(localStorage.graphScale) {
    time.currentSelected = localStorage.graphScale;
  } else {
    time.currentSelected = "month";
  }
  graphUI.updateDropdownPos();
  serverReq("meta/tracker.txt", function(data) {
    graphUI.allItems=data;
    query = webPage.parseURLParams(window.location.href)
    if(query!=undefined) {
      query = query.q[0].replace(/"/g, "");


      document.getElementById("inputText").value = query.replace(/_/g," ");
      webPage.currentQuery=query;
      graphs.getGraphData(query, function() {
        graphUI.setUpInfo();
      });
      document.getElementById("title").innerHTML = query.replace(/_/g," ")+" graphs";
    } else {
      document.getElementById("allInfo").style.display = "none"
    }

  });


}

var graphUI= {
  allItems:undefined,
  mouseOverInput:false,
  setUpInfo: function() {
    q = webPage.currentQuery.replace(/ /g, "_");
    graphMath.checkVolitility(q,function(volitility){
      if(volitility>=10) {
        document.getElementById("violentTextVal").innerHTML = "prices change by about "+Math.round(volitility)+"% every hour";
        document.getElementById("violentText").style.display="block";
      } else {
        document.getElementById("violentText").style.display = "none";
      }
    });

    var priceSortedMax = graphs.markerIndicators.slice();
    priceSortedMax.sort(function(a,b){return b["dataPoint"].data-a["dataPoint"].data});
    var priceSortedMin = graphs.markerIndicators.slice();
    priceSortedMin.sort(function(a,b){return a["dataPoint"].data-b["dataPoint"].data});

    var maxE = document.getElementById("graphPriceMax");
    maxE.innerHTML = graphUI.cleanUpNumbers(priceSortedMax[priceSortedMax.length-1].dataPoint.data);
    maxE.style.top = (priceSortedMax[priceSortedMax.length-1].currentY+canvas.offsetTop)+"px";
    maxE.style.left="10vw";

    var minE = document.getElementById("graphPriceMin");
    minE.innerHTML = graphUI.cleanUpNumbers(priceSortedMin[priceSortedMin.length-1].dataPoint.data);
    minE.style.top = (priceSortedMin[priceSortedMin.length-1].currentY+canvas.offsetTop)+"px";
    minE.style.left="10vw";

    var currentE = document.getElementById("currentLowestBIN");
    if(graphs.currentGraphData[0].data == "no_data") {
      currentE.innerHTML = "no current BIN auctions"
    } else {
      currentE.innerHTML = "Current Lowest BIN: " + graphUI.cleanUpNumbers(graphs.currentGraphData[0].data);
    }

    currentE = document.getElementById("lowestBIN");
    currentE.innerHTML = "lowest Price (lowest BIN): "+ graphUI.cleanUpNumbers(priceSortedMax[priceSortedMax.length-1].dataPoint.data);

    currentE = document.getElementById("highestBIN");
    currentE.innerHTML = "Highest Price (lowest BIN): "+ graphUI.cleanUpNumbers(priceSortedMin[priceSortedMin.length-1].dataPoint.data);
  },
  updateDropdownPos: function(updateGraph) {
    var e = document.getElementById("timeDrop");
    var canvas = document.getElementById("canvas");
    var thisHeight = e.getBoundingClientRect().bottom-e.getBoundingClientRect().top;
    e.style.left=window.innerWidth*0.1+"px";
    e.style.top=(canvas.getBoundingClientRect().top - thisHeight)+"px";
    document.getElementById("timeDropLabel").innerHTML = time.currentSelected;
  },
  updateTimeScale: function(e) {
    var id = e.innerHTML;
    time.currentSelected=id;
    localStorage.graphScale=id;
    document.getElementById("timeDropLabel").innerHTML = time.currentSelected;
    graphs.getGraphData(query, function() {
      graphUI.setUpInfo();
    });

  },
  updateLine: function(e) {
    var mX = e.clientX-window.innerWidth*0.1;
    var nearestPoint = graphs.markerIndicators[graphUI.getNearestPoint(mX)];
    var date = graphs.cleanUpDate(nearestPoint.dataPoint.time);

    var textE = document.getElementById("graphInfo");
    textE.style.left=(nearestPoint.position+window.innerWidth*0.1+10)+"px";
    textE.style.top=(nearestPoint.currentY+document.getElementById("canvas").offsetTop)+"px";
    textE.innerHTML=graphUI.cleanUpNumbers(nearestPoint.dataPoint.data)+"<br>"+date.time+" "+date.unit + " ago";
    textE.style.display="block";

    var lineE = document.getElementById("graphLine");
    lineE.style.height = document.getElementById("canvas").height+"px";
    lineE.style.top = document.getElementById("canvas").offsetTop+"px"
    lineE.style.left = (nearestPoint.position+window.innerWidth*0.1)+"px";
    lineE.style.display = "block";
  },
  hideLineData: function(a) {
    document.getElementById("graphInfo").style.display = "none";
    document.getElementById("graphLine").style.display = "none";
  },
  getNearestPoint: function(x) {
    var dists=[];
    for(var i=0;i<graphs.markerIndicators.length;i++) {
      dists.push(Math.abs(x-graphs.markerIndicators[i].position));
    }
    return dists.indexOf(Math.min(...dists));
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

  populateSearchBox: function(e) {
    var newItemName,options=[];
    for(var i=1;i<graphUI.allItems.length && options.length<100;i++) {
      newItemName=graphUI.fileToWord(graphUI.allItems[i]);
      if(newItemName.toLowerCase().includes(e.value.toLowerCase())) options.push({displayName:newItemName,fileName:graphUI.allItems[i]});
    };
    var container = document.getElementById("searchResults"),newE;
    container.style.height="12.2cm";
    container.innerHTML = "";
    for(var i=0;i<options.length;i++) {
      let option = options[i];
      newE = document.createElement("div");
      newE.classList.add("singleSearchResult");
      newE.innerHTML = options[i].displayName;
      newE.onclick = function() {
        graphUI.searchItem(option)
      }
      container.appendChild(newE);
    }
  },
  hideSearchResults: function() {
    if(!graphUI.mouseOverInput) {
      document.getElementById("searchResults").style.height="0px";
      document.getElementById("searchResults").innerHTML = "";
    }
  },
  searchItem: function(item) {
    document.getElementById("searchResults").style.height="0px";
    document.getElementById("searchResults").innerHTML = "";

    document.getElementById("inputText").value = item.displayName;
    graphs.getGraphData(item.fileName, function() {
      graphUI.setUpInfo();
    });
    var newURL = webPage.updateURLParameter(window.location.href, "q", item.fileName);
    window.location.href = newURL;
  },
  fileToWord: function(str) {
    str = str.replace(/_/g," ");
    return str;
  }
}


var webPage = {
  currentQuery:undefined,
  parseURLParams: function (url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
  },
  updateURLParameter: function (url, param, paramVal){
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";
    if (additionalURL) {
        tempArray = additionalURL.split("&");
        for (var i=0; i<tempArray.length; i++){
            if(tempArray[i].split('=')[0] != param){
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }
    }

    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
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
