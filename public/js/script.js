$("#hide").click(function(){
    $("#mp4").hide();
    $("#hide").hide();
    $("#show").show();
});
$("#show").click(function(){
    $("#mp4").show();
    $("#hide").show();
    $("#show").hide();
});
$(".hide").click(function(){
    var id = this.id.substring(5);
    $("#"+id+"_div").hide();
    $("#hide_"+id).hide();
    $("#show_"+id).show();
});
$(".show").click(function(){
    var id = this.id.substring(5);
    $("#"+id+"_div").show();
    $("#hide_"+id).show();
    $("#show_"+id).hide();
});
$("#click").click(function(){
    $("#myPopup").show();
});
$("#click2").click(function(){
    $("#myPopup").hide();
});