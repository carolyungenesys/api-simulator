function startTime() {
    var today = new Date();
    var Y = today.getUTCFullYear();
    var M = today.getUTCMonth();
    var D = today.getUTCDate();
    var h = today.getUTCHours();
    var m = today.getUTCMinutes();
    var s = today.getUTCSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('txt').innerHTML = Y + "-" +  M + "-" + D + " " + h + ":" + m + ":" + s;
    var t = setTimeout(startTime, 500);
}
function checkTime(i) {
    if (i < 10) {i = "0" + i};
    return i;
}