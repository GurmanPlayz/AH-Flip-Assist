var graphMath = {
  checkVolitility: function(fileName, callback) {
    serverReq("meta/uploadTimes.txt", function(timeData) {
      serverReq(fileName+".txt",function(priceData) {
        var currentDate = new Date();
        var currentTime = currentDate.getTime();
        var allDataPoints = [];
        for(var i=0;i<priceData.length;i++) {
          if(currentTime-timeData[i]<=time[time.currentSelected] || time.currentSelected == "all") {
            if(priceData[i] != "no_data") {
              allDataPoints.push({price:priceData[i],time:timeData[i]});
            }
          }
        }
        var allMarkups = [];
        var sum =0;
        for(var i=1;i<allDataPoints.length;i++) {
          var priceDiff=Math.abs(allDataPoints[i].price/allDataPoints[i-1].price)-1;
          var timeDiff=(allDataPoints[i-1].time-allDataPoints[i].time)/3.6e+6;
          allMarkups.push((priceDiff/timeDiff)*100)
          sum+=Math.abs(priceDiff/timeDiff)*100
        }
        sum/=allDataPoints.length-1;
        callback(sum)
      });
    });
  }
}
