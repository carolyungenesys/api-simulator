var chart = document.getElementsByClassName("plot");
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
} 
var time = httpGet('/testcase/chart/'+document.title+'/0');
var time = time.split(',');
console.log(time);
for (var i=0; i<chart.length; i++){
  var data = httpGet('/testcase/chart/'+document.title+'/'+chart[i].getAttribute("col"));
  var data = data.split(',');
  var plot = new Chart(chart[i], {
  type: 'line',
  data: {
    labels: time,
    datasets: [{
      label: chart[i].getAttribute('id'),
      data: data,
      backgroundColor: "rgba(153,255,51,0.4)",
      pointRadius: 1
    }]
  }
  });
}
