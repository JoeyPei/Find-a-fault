var steps = new Array();
var orgwidth = 0;
var orgheight = 0;
var width = 0;
var height = 0;
var radius = 15;
var maxClickCount1 = 20;
var maxClickCount2 = 30;
var canClickCount = maxClickCount1;
var lblClickCount = 0;
var lnkNext = 0;
var hasChecked = false;
var hasShowList = false;
var curimageno = 1;
var canvascard;
var canvas;
var context;
var lnkNext;
var player_score;
var imgbackground1 = new Image();
var imgbackground2 = new Image();
var pointer = new Image();
var bingo = new Image();
$(document).ready(function(){
    initHeader();
    console.log("ready");
//    $.ajaxSetup({
//        dataType: "json",
//        beforeSend: function(xhr, settings){
//            var csrftoken = $.cookie('csrftoken');
//            xhr.setRequestHeader("X-CSRFToken", csrftoken);
//        }
//    });
    $('#lnkSubmit').click(function(){
        var tmp_data = new Array();
        for (var i in steps)
        {
            tmp_data.push(JSON.stringify(steps[i], ["x", "y", "cardno"]));
        }
        var name;
        window.wxc.xcConfirm("工号:","input",{onOk:function(msg){
        name =msg;
        re = /^\d{4,5}$/;
        if (re.test(msg) === false)
        {
            alert('请输入正确工号(4-5位)');
            return;
        }
        jQuery.ajax({
            url: "/activity/score/",
            type: "POST",
            dataType: "json",
            data: {
                    'player_name': name,
                    'point[]': tmp_data
                   },
            error: function(request, status) {
                        console.log(request.status);
            },
            success: function(response) {
                var right = response['right'];
                var wrong = response['wrong'];
                player_score = response['score'];
                if (hasChecked) {
                    return;
                }
                for (var i in right)
                {
                    steps[right[i]].checkstatus = 1;
                }
                for (var i in wrong)
                {
                    steps[wrong[i]].checkstatus = 2;
                }

                hasChecked = true;
                lblClickCount.innerText = 0;

                update();
                console.log($('#lnkSubmit').attr("disabled"));
                $('#lnkSubmit').attr("disabled","disable");
            }
        });
       }
      });

    });
    $('#lnkViewList').click(function(){
        console.log("list");
        jQuery.ajax({
            url: "/activity/rank/",
            type: "GET",
            dataType: "json",
            error: function(request) {
                alert("error");
            },
            success: function(response) {
                console.log("list_response");
                if (hasShowList) {
                    update();
                    hasShowList = false;
                    return;
                }
                console.log(response)
                var ileft = (canvas.width - 400) / 2;
                var itop = 40;
                var lineHeight = 32;
                var lx = ileft + 60;
                console.log(ileft, itop);
                drawRoundRect(ileft, itop);
                function repeat(str, num) {
                    return (num < 0) ? "" : new Array(num + 1).join(str);
                }
                context.font = '40px Cursive ';
                context.lineWidth = 3;
                context.strokeStyle = 'rgba(0,0,0,1.0)';
                context.fillStyle = 'rgba(0,0,0,1.0)';
                context.strokeText('排行榜', lx + 80, itop + 60);
                context.font = '24px Monospace ';
                context.strokeText('排名    工号         得分', lx-3, itop + 100);
                context.font = '24px Monospace ';

                var line = new String();
                var i = 0;
                var blank;
                for (var p in response["data"]) {
                    blank = (i > 8)?"     ":"      ";
                    line = i + 1 + blank + response["data"][p][0];
                    line += repeat(' ', 15 - response["data"][p][0].length);
                    console.log(line)
                    line += response["data"][p][1];
                    context.strokeText(line, lx, itop + lineHeight * i + 140);
                    i++;
                }
                hasShowList = true;
            }
        });
    });
 });


function clickNext() {
    if (curimageno == 1) {
        curimageno = 2;
        lnkNext.innerText = '入 门 关';
        $("#lnkSubmit").css('visibility', 'visible');
        //document.getElementById('lnkSubmit').style.visibility = 'visible';
    }
    else {
        curimageno = 1;
        lnkNext.innerText = '进 阶 关';
        $("#lnkSubmit").css('visibility', 'hidden');
        //document.getElementById('lnkSubmit').style.visibility = 'hidden';
    }
    update();
}

function canvasClick(e) {
    var evt = e || window.event;

    if (hasShowList) {
        update();
        return;
    }

    if (hasChecked) {
        return;
    }

    // 取得画布上被单击的点
    var offsetX = $('canvas').offset().left;//(document.body.clientWidth > getCurImage().width)?(document.body.clientWidth - getCurImage().width)/2:0;
    var offsetY = $('canvas').offset().top;
    var clickX = evt.pageX - offsetX;
    var clickY = evt.pageY - offsetY;

    if(evt.pageX===undefined) {
	clickX = evt.offsetX;
	clickY = evt.offsetY;
    }

    //lblPosX.innerText = clickX;
    //lblPosY.innerText = clickY;

    // 查找被单击的圆圈
    var hasfound = false;
    for (var i = steps.length - 1; i >= 0; i--) {
        var circle = steps[i];
        if (circle.cardno != curimageno)
            continue;

        //使用勾股定理计算这个点与圆心之间的距离
        var distanceFromCenter = Math.sqrt(Math.pow(circle.x - clickX, 2) + Math.pow(circle.y - clickY, 2));
        // 判断这个点是否在圆圈中
        if (distanceFromCenter <= radius) {
            steps.splice(i, 1);
            hasfound = true;
            update();
            break;
        }
    }

    if (!hasfound && canClickCount > 0) {
        addClickCircle(clickX, clickY);
    }
}

function drawRoundRect(x, y) {
    var rrWidth = 400;
    var rrHeight = 450;
    var rrRadius = 10;

    context.strokeStyle = 'rgba(255,255,255,0.60)';
    context.fillStyle = 'rgba(255,255,255,0.80)';
    context.beginPath();
    context.moveTo(x + rrRadius, y);
    context.lineTo(x + rrWidth - rrRadius, y);
    context.quadraticCurveTo(x + rrWidth, y, x + rrWidth, y + rrRadius);
    context.lineTo(x + rrWidth, y + rrHeight - rrRadius);
    context.quadraticCurveTo(x + rrWidth, y + rrHeight, x + rrWidth - rrRadius, y + rrHeight);
    context.lineTo(x + rrRadius, y + rrHeight);
    context.quadraticCurveTo(x, y + rrHeight, x, y + rrHeight - rrRadius);
    context.lineTo(x, y + rrRadius);
    context.quadraticCurveTo(x, y, x + rrRadius, y);
    context.closePath();
    context.stroke();
    context.fill();
}


function Circle(x, y){
    this.x = x;
    this.y = y;
    this.cardno = 1;
    this.checkstatus = 0;
}

function getCurImage() {
    if (curimageno == 2)
    {
        return imgbackground2;
    }
    else
    {
        return imgbackground1;
//        $("#lnkSubmit").css("visibility", "hidden");
        document.getElementById('lnkSubmit').style.visibility = 'hidden';
    }

}

function initHeader() {
    width = window.innerWidth;
    height = window.innerHeight;
    orgheight = height;
    orgwidth = width;
    imgbackground1.src = "http://sec:10654/static/img/secgame1.png";
    imgbackground2.src = "http://sec:10654/static/img/secgame2.png";
    pointer.src = "http://sec:10654/static/img/point.png";
    bingo.src = "http://sec:10654/static/img/right.png";
    canvascard = document.getElementById('canvas-card');
    //if(imgbackground1.complete == false){ setTimeout("function();",5000);};
    canvascard.style.height = 495 + 'px';
    canvascard.style.width = 1024 + 'px';
    canvas = document.getElementById("canvas");
    canvas.width = 1024;
    canvas.height = 495;
    context = canvas.getContext("2d");

    context.strokeStyle = 'rgba(255,0,0,0.50)';
    context.fillStyle = 'rgba(255,0,0,0.50)';
    context.lineWidth = 3;

    imgbackground1.onload = function(){
    context.drawImage(getCurImage(), 0, 0);
    };

    canvas.onclick = canvasClick;

    lblClickCount = document.getElementById('lblClickCount');
    lblClickCount.innerText = canClickCount;

    lnkNext = document.getElementById('lnkNext');
}

function addClickCircle(x, y) {
    var circle = new Circle(x, y);
    circle.cardno = curimageno;
    steps.push(circle);
    update();
}

function update() {
    if (canvas.height !== getCurImage().height)
    {
        canvascard.style.height = getCurImage().height + 'px';
        canvas.height = getCurImage().height;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.drawImage(getCurImage(), 0, 0);
    if (hasChecked)
    {
        $('#player_score').html("你的得分是<b style='color:red'> " + player_score + "</b> 分");
    }
    else
    {
        $('#player_score').html("");
    }

    var icount = 0;
    var offset = (window.innerWidth - canvas.offsetLeft)/2;
    for (var i = 0; i < steps.length; i++) {
        var circle = steps[i];
        if (circle.cardno != curimageno)
            continue;

        if (circle.checkstatus == 1) {
//            context.strokeStyle = 'rgba(0,255,0,0.50)';
//            context.fillStyle = 'rgba(0,255,0,0.50)';
//            context.lineWidth = 3;
//            context.beginPath();
//            context.arc(circle.x, circle.y, radius, 0, Math.PI * 2);
//            context.closePath();
//            context.stroke();
            context.drawImage(bingo, circle.x-18, circle.y-18, 36, 36);
        }
        else if (circle.checkstatus == 2) {
//            context.strokeStyle = 'rgba(255,0,0,0.50)';
//            context.fillStyle = 'rgba(255,0,0,0.50)';
//            context.lineWidth = 3;
//            context.beginPath();
//            context.arc(circle.x, circle.y, radius, 0, Math.PI * 2);
//            context.closePath();
//            context.stroke();
            context.drawImage(pointer, circle.x-18, circle.y-18, 36, 36);
        }
        else {
            context.drawImage(pointer, circle.x-18, circle.y-18, 36, 36);
        }
        icount++;
    }

    if (hasChecked) {
        canClickCount = 0;
    }
    else {
        if (curimageno == 2)
            canClickCount = maxClickCount2 - icount;
        else
            canClickCount = maxClickCount1 - icount;
    }
    lblClickCount.innerText = canClickCount;
}

