var proc=0;//0=待初始化；1=等待用户提交视频网址；2=等待程序提交get.json
var onsearch={};//使用搜索引擎
var openhome={};//第一步打开主页
var urlnotsupport={};//打开主页后提交的网址不规范
var getyoukujson={};//获取优酷的get.json?文件
var geturlretry={};//get.json数据有误，请求程序重试
var v={};//最终获取的地址

function main(){reset();return gettask()}//主方法
function search(w){reset();proc=1;onsearch.url+=w;return JSON.stringify(onsearch);}
function ver(){return 1;}//js版本
function minexecver(){return 1;}//所能运行的最低程序版本
function gettask(){
 proc++;
 switch(proc){
  case 1:
   return JSON.stringify(openhome);//打开主页，等待用户提交视频地址
  case 2:
   return JSON.stringify(getyoukujson);//获取get.json
  case 3:
   return JSON.stringify(v);//'{"act":"finish"}'//or 'fin'
 }
}
function submit(u){
 switch(proc){
  case 1://向本JS提交了所需要解析的视频地址
   if(u.indexOf('video/id_')>-1){
    if(u.indexOf('.html')>-1||u.indexOf('?')>-1){
     getyoukujson.url+=u.split('/id_')[1].split('==')[0]+'==';
    }else{
     getyoukujson.url+=u.split('/id_')[1]
    }
    getyoukujson.url+=getyoukujson.tmp0;
    return gettask();//地址正确，分配下一个任务
   }
   return JSON.stringify(urlnotsupport);//地址错误，要求重新提交
  case 2://向本JS提交了源码，开始分析地址。
   u=eval('('+ u +')');
   if(u.data !=undefined){
    v={};
    v.act='finish';
    v.name=u.data.video.title;//视频名称
    v.v=[];//在此定义链接数组
    var t={};u=u.data.stream;
    for(var i=0;i<u.length;i++){
     t.len=u[i].milliseconds_video;//视频长度
     t.size=u[i].size;//视频文件大小
     t.scr=[u[i].width,u[i].height];//视频宽高
     t.part=u[i].segs.length;//视频段落数
     t.parts=[];for(var i2=0;i2<u[i].segs.length;i2++){
      t.parts.push(u[i].segs[i2].cdn_url);
     }
     v.v.push(t);t={};
    }
    return gettask();
   }else{//出现故障
    return JSON.stringify(geturlretry);
   }
 }//结束switch
}

function reset(){
 proc=0;
 var j={};
 j.act='browser';j.url='http://www.soku.com/search_video/q_';
 j.nextact='submit';j.nextarg=1;j.argtype='browserurl';j.autoexec=0;
 onsearch=j;j={};//使用搜索，等待用户下一步操作

 j.act='browser';j.url='http://www.youku.com/';
 j.nextact='submit';j.nextarg=1;j.argtype='browserurl';j.autoexec=0;
 openhome=j;j={};//打开主页，等待用户下一步操作

 j.act='warn';j.msg='\u7F51\u5740\u4E0D\u7B26\u5408\u89C4\u8303\u3002';//“网址不符合规范。”
 j.nextact='submit';j.nextarg=1;j.argtype='browserurl';j.autoexec=0;
 urlnotsupport=j;j={};//用户提交的网址不规范，继续等待用户提交网址

 j.act='geturl';j.url='https://ups.youku.com/ups/get.json?vid=';
 j.tmp0='&ccode=0501&client_ip=0.0.0.0&client_ts='+(parseInt(new Date().getTime()/1e3))+'&utid='+getrandomstr();
 j.nextact='submit',j.nextarg=1;j.argtype='return';j.autoexec=1;
 getyoukujson=j;j={};//获取视频简要信息，完成后立即提交
 
 j.act='warn';j.msg='get.json\u6570\u636E\u6709\u8BEF\u3002';//“get.json数据有误。”
 j.nextact='submit';j.nextarg=1;j.argtype='return';j.autoexec=1;
 geturlretry=j;j={};//get.json数据有误，请求程序重试。
}
function getrandomstr(){
 var fn='';var libra='0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
 for(var i=0;i<rd(24,26);i++)fn+=libra.charAt(rd(0,61));
 return fn;
}
function rd(min,max){return min+Math.round(Math.random()*(max-min))}
