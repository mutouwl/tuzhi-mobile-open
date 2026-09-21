var ROP = function(){
	var ICS_ADDR = "mqttdms.aodianyun.com";
	var ROP_FLASH_SITE = 'https://cdn.aodianyun.com/dms/';
	function EventEmit(){
		this.callback_map_ = {}
	}
	EventEmit.prototype.On = function(evt,func){
		if(typeof func != "function" || typeof evt != "string"){
			throw new Error("error arguments ");
		}
		var arr = this.callback_map_[evt]
		if(arr == null){
			arr = this.callback_map_[evt] = new Array()
		}
		arr.push(func)
	}
	EventEmit.prototype.Emit = function (evt,arg1,arg2){
		var arr = this.callback_map_[evt];
		if (arr == null) return;
		for(var i in arr){
			try{
				if(arr[i])arr[i](arg1,arg2);
			}catch(err){
				if (window.console){
					window.console.log("catch err at "+evt+" callback",err)
				}
			}
		}
	}
	EventEmit.prototype.Off = function (evt, func = '') {
		if (typeof evt !== "string") {
			throw new Error("event must be a string");
		}
		const arr = this.callback_map_[evt];
		if (!arr) return;

		if (typeof func === "function") {
			// 移除指定回调
			for (let i = arr.length - 1; i >= 0; i--) {
				if (arr[i] === func) {
					arr.splice(i, 1);
				}
			}
			// 如果移空了，可以删掉这个事件名
			if (arr.length === 0) {
				delete this.callback_map_[evt];
			}
		} else {
			// 如果没有传入 func，移除该事件下所有回调
			delete this.callback_map_[evt];
		}
	}
	var eventEmit = new EventEmit()
	var topic_list_ = [];
	var WebSocketRop = function() {
		var pubKey_ = null;
		var subKey_ = null
		var mqttClient_ = null
		var useSSL_ =false;
		var timers = 0;
		
		var STATE_INIT = 0;
		var STATE_ENTERING = 4;
		var STATE_ENTERED = 5;
		var STATE_ENTER_FAILED = 6;
		var STATE_REENTERING = 7;
		var state_ = STATE_INIT;
		
		var reenter_max_ = 5000
		var reenter_df_ = 1000
		var re_enter_timeout_ = reenter_df_
		var timer_ = null;
		var enter_times_ = 0;
		var clientid_ = null;
	    function ReEnter(){
	    	if(timer_!=null) return;
	    	if (re_enter_timeout_ > reenter_max_) {
	    		eventEmit.Emit("losed","")
	    		// 退避重试超时停止自动重连：必须复位状态机（Leave → STATE_INIT），
	    		// 否则 Enter() 在 state_!=STATE_INIT 时静默丢弃，页面「重新连接」点击无效
	    		Leave();
				return;
			}
			if (state_ == STATE_ENTERED || state_ == STATE_REENTERING) {
				state_ = STATE_REENTERING;
				timer_ = setTimeout(InternalEnter,re_enter_timeout_);
				re_enter_timeout_+=reenter_df_
				
			}
	    }
	    function InternalSubscribe ( topic,qos ){
	    	if (state_ == STATE_ENTERED ){
	    		if(isNaN(qos)) qos = 0;
				mqttClient_.subscribe(topic,{qos:qos});
			}
	    }
	    function InternalUnSubscribe ( topic ){
			if (state_ == STATE_ENTERED) {
				mqttClient_.unsubscribe(topic);
			}	
	    }
	    function InternalEnter(){
	    	timer_ = null;
	    	if(state_ == STATE_REENTERING){
	    		eventEmit.Emit("reconnect")
	    	}
			if(clientid_ == null){
				clientid_ = "ws2-"+Paho.MQTT.NewGuid()
			}
			if(useSSL_){
				var port_ = 443;
				ICS_ADDR =  "mqttdms.aodianyun.com";
			}else{
				var port_ = 8000;
			}
			if(mqttClient_){
				try{
					mqttClient_.disconnect();
				}catch(err){

				}
			}
	    	mqttClient_ = new Paho.MQTT.Client(ICS_ADDR, port_,clientid_ );
            mqttClient_.onConnectionLost = function(responseObject){
            	 if (responseObject.errorCode !== 0){
            	 	eventEmit.Emit("offline",responseObject.errorMessage)
					ReEnter()
				}
			};
            mqttClient_.onMessageArrived = function(message){
            	if(message.destinationName == '__sys__'){
            		try{
            			var msg = JSON.parse(message.payloadString);
            			if(msg.cmd == "kill"){

            				eventEmit.Emit('connectold');
            				eventEmit.Emit('losed');
            				Leave();
            				return;
            			}
            		}catch(err){

            		}
            	}
				eventEmit.Emit("publish_data",message.payloadString,message.destinationName)
			}
			try{
				 mqttClient_.connect({
					timeout:10, // connect timeout
					userName:pubKey_,
					password:subKey_,
					keepAliveInterval:60 , // keepalive 
					cleanSession:true , // 
					useSSL:useSSL_,
					onSuccess:function(){
						state_ = STATE_ENTERED
						re_enter_timeout_ = reenter_df_
						for (var i=0; i < topic_list_.length; i++){
							InternalSubscribe(topic_list_[i].topic,topic_list_[i].qos)
						}
						eventEmit.Emit("enter_suc")
					},
					onFailure:function(err){
						if( state_ == STATE_ENTERING ){
							if(enter_times_++ >= 3){
								state_ = STATE_ENTER_FAILED
								enter_times_ = 0;
								eventEmit.Emit("enter_fail",err.errorMessage)
								Leave()
							}else{

								setTimeout(InternalEnter,1000);
							}
							
							
						}else if (state_ == STATE_REENTERING){
							eventEmit.Emit("offline",err.errorMessage)
							ReEnter()
						}
					}
				});
			}catch(err){
				console.log(err)
				ReEnter()
			}
           
	    }
		//window.addEventListener("unload", Leave,false);
	    function Leave(){
			state_ = STATE_INIT;
			enter_times_ = 0;
			re_enter_timeout_ = reenter_df_;
			// 原实现误传 re_enter_timeout_（毫秒数值）作为句柄，定时器实际未被清理，
			// 会导致后续 ReEnter 因 timer_ 残留直接 return，手动重连失效
			if (timer_ != null) {
				clearTimeout(timer_);
				timer_ = null;
			}
			try{
				console.log('Leave called');
				if(mqttClient_)
					mqttClient_.disconnect()
			}catch(err){
				console.log('Leave err',err);
			}
	    }
    	function LoadWs ( callback ){
			var s = document.createElement('script');
			s.type = 'text/javascript';
			s.async = false;
			s.src = ROP_FLASH_SITE+'ws.js?v=2.0.0';
			s.charset = 'UTF-8';
			(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(s);
			var wait = 100
			var timerrr = setInterval(function(){							
				if (typeof Paho !="undefined") {
					clearInterval(timerrr);
					callback();
				}
				wait--
				if(wait <=0){
					clearInterval(timerrr);
					callback("load ws fail")
				}
			},10);
		}
		return {
			Enter:function( pubKey,subKey,clientid,useSSL ){
				if(state_ == STATE_INIT){
					state_ = STATE_ENTERING;
					pubKey_ = pubKey;
					useSSL_ = !!useSSL;
					subKey_ = subKey;
					if (subKey_ == null) {
						subKey_ = pubKey
					}
					if(clientid != null){
						clientid_ = clientid;
					}
					if(typeof Paho == "undefined"){
						LoadWs(function(err){
							if(err != null){
								eventEmit.Emit("enter_fail",err)
								return
							}
							InternalEnter();
						});
					}else{
						InternalEnter();
					}
				}
			},
			Leave:Leave,
			On:function(evt,func){
				eventEmit.On(evt,func)
			},
			Off:function(evt,func){
				eventEmit.Off(evt,func)
			},
			Publish:function( body ,topic ,qos,retain){
				if (state_ == STATE_ENTERED ){
					var message = new Paho.MQTT.Message( body);
					message.destinationName = topic;
					if(isNaN(Number(qos))){
						message.qos = 0;
					}else{
						message.qos = Number(qos);
					}
					message.retained = Boolean(retain);
					mqttClient_.send(message)
				}
			},
			Subscribe:function( topic,qos ){
				topic = topic.toString();
				qos = Number(qos);
				if(qos == null) qos = 0;
				if(isNaN(qos)) qos = 0;
				if(qos > 2) qos = 2;
				if(qos < 0) qos = 0;
				if(!topic || topic.length == 0)return;
				for(var k=0; k < topic_list_.length; k++){
					if(topic_list_[k].topic == topic){
						return;
					}
				}
				topic_list_.push({topic:topic,qos:qos});
				InternalSubscribe(topic,qos);
			},
			UnSubscribe:function( topic ){
				topic = topic.toString();
				if(!topic || topic.length == 0)return;
				for(var k=0; k<topic_list_.length; k++){
					if(topic_list_[k].topic == topic){
						topic_list_.splice(k,1);
						InternalUnSubscribe(topic);
						return
					}
				}
			}
		}		
	}

	var FlashRop = function() {
		var swfobject=function(){var D="undefined",r="object",T="Shockwave Flash",Z="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",S="SWFObjectExprInst",x="onreadystatechange",Q=window,h=document,t=navigator,V=false,X=[],o=[],P=[],K=[],I,p,E,B,L=false,a=false,m,G,j=true,l=false,O=function(){var ad=typeof h.getElementById!=D&&typeof h.getElementsByTagName!=D&&typeof h.createElement!=D,ak=t.userAgent.toLowerCase(),ab=t.platform.toLowerCase(),ah=ab?/win/.test(ab):/win/.test(ak),af=ab?/mac/.test(ab):/mac/.test(ak),ai=/webkit/.test(ak)?parseFloat(ak.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,aa=t.appName==="Microsoft Internet Explorer",aj=[0,0,0],ae=null;if(typeof t.plugins!=D&&typeof t.plugins[T]==r){ae=t.plugins[T].description;if(ae&&(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&t.mimeTypes[q].enabledPlugin)){V=true;aa=false;ae=ae.replace(/^.*\s+(\S+\s+\S+$)/,"$1");aj[0]=n(ae.replace(/^(.*)\..*$/,"$1"));aj[1]=n(ae.replace(/^.*\.(.*)\s.*$/,"$1"));aj[2]=/[a-zA-Z]/.test(ae)?n(ae.replace(/^.*[a-zA-Z]+(.*)$/,"$1")):0}}else{if(typeof Q.ActiveXObject!=D){try{var ag=new ActiveXObject(Z);if(ag){ae=ag.GetVariable("$version");if(ae){aa=true;ae=ae.split(" ")[1].split(",");aj=[n(ae[0]),n(ae[1]),n(ae[2])]}}}catch(ac){}}}return{w3:ad,pv:aj,wk:ai,ie:aa,win:ah,mac:af}}(),i=function(){if(!O.w3){return}if((typeof h.readyState!=D&&(h.readyState==="complete"||h.readyState==="interactive"))||(typeof h.readyState==D&&(h.getElementsByTagName("body")[0]||h.body))){f()}if(!L){if(typeof h.addEventListener!=D){h.addEventListener("DOMContentLoaded",f,false)}if(O.ie){h.attachEvent(x,function aa(){if(h.readyState=="complete"){h.detachEvent(x,aa);f()}});if(Q==top){(function ac(){if(L){return}try{h.documentElement.doScroll("left")}catch(ad){setTimeout(ac,0);return}f()}())}}if(O.wk){(function ab(){if(L){return}if(!/loaded|complete/.test(h.readyState)){setTimeout(ab,0);return}f()}())}}}();function f(){if(L||!document.getElementsByTagName("body")[0]){return}try{var ac,ad=C("span");ad.style.display="none";ac=h.getElementsByTagName("body")[0].appendChild(ad);ac.parentNode.removeChild(ac);ac=null;ad=null}catch(ae){return}L=true;var aa=X.length;for(var ab=0;ab<aa;ab++){X[ab]()}}function M(aa){if(L){aa()}else{X[X.length]=aa}}function s(ab){if(typeof Q.addEventListener!=D){Q.addEventListener("load",ab,false)}else{if(typeof h.addEventListener!=D){h.addEventListener("load",ab,false)}else{if(typeof Q.attachEvent!=D){g(Q,"onload",ab)}else{if(typeof Q.onload=="function"){var aa=Q.onload;Q.onload=function(){aa();ab()}}else{Q.onload=ab}}}}}function Y(){var aa=h.getElementsByTagName("body")[0];var ae=C(r);ae.setAttribute("style","visibility: hidden;");ae.setAttribute("type",q);var ad=aa.appendChild(ae);if(ad){var ac=0;(function ab(){if(typeof ad.GetVariable!=D){try{var ag=ad.GetVariable("$version");if(ag){ag=ag.split(" ")[1].split(",");O.pv=[n(ag[0]),n(ag[1]),n(ag[2])]}}catch(af){O.pv=[8,0,0]}}else{if(ac<10){ac++;setTimeout(ab,10);return}}aa.removeChild(ae);ad=null;H()}())}else{H()}}function H(){var aj=o.length;if(aj>0){for(var ai=0;ai<aj;ai++){var ab=o[ai].id;var ae=o[ai].callbackFn;var ad={success:false,id:ab};if(O.pv[0]>0){var ah=c(ab);if(ah){if(F(o[ai].swfVersion)&&!(O.wk&&O.wk<312)){w(ab,true);if(ae){ad.success=true;ad.ref=z(ab);ad.id=ab;ae(ad)}}else{if(o[ai].expressInstall&&A()){var al={};al.data=o[ai].expressInstall;al.width=ah.getAttribute("width")||"0";al.height=ah.getAttribute("height")||"0";if(ah.getAttribute("class")){al.styleclass=ah.getAttribute("class")}if(ah.getAttribute("align")){al.align=ah.getAttribute("align")}var ak={};var aa=ah.getElementsByTagName("param");var af=aa.length;for(var ag=0;ag<af;ag++){if(aa[ag].getAttribute("name").toLowerCase()!="movie"){ak[aa[ag].getAttribute("name")]=aa[ag].getAttribute("value")}}R(al,ak,ab,ae)}else{b(ah);if(ae){ae(ad)}}}}}else{w(ab,true);if(ae){var ac=z(ab);if(ac&&typeof ac.SetVariable!=D){ad.success=true;ad.ref=ac;ad.id=ac.id}ae(ad)}}}}}X[0]=function(){if(V){Y()}else{H()}};function z(ac){var aa=null,ab=c(ac);if(ab&&ab.nodeName.toUpperCase()==="OBJECT"){if(typeof ab.SetVariable!==D){aa=ab}else{aa=ab.getElementsByTagName(r)[0]||ab}}return aa}function A(){return !a&&F("6.0.65")&&(O.win||O.mac)&&!(O.wk&&O.wk<312)}function R(ad,ae,aa,ac){var ah=c(aa);aa=W(aa);a=true;E=ac||null;B={success:false,id:aa};if(ah){if(ah.nodeName.toUpperCase()=="OBJECT"){I=J(ah);p=null}else{I=ah;p=aa}ad.id=S;if(typeof ad.width==D||(!/%$/.test(ad.width)&&n(ad.width)<310)){ad.width="310"}if(typeof ad.height==D||(!/%$/.test(ad.height)&&n(ad.height)<137)){ad.height="137"}var ag=O.ie?"ActiveX":"PlugIn",af="MMredirectURL="+encodeURIComponent(Q.location.toString().replace(/&/g,"%26"))+"&MMplayerType="+ag+"&MMdoctitle="+encodeURIComponent(h.title.slice(0,47)+" - Flash Player Installation");if(typeof ae.flashvars!=D){ae.flashvars+="&"+af}else{ae.flashvars=af}if(O.ie&&ah.readyState!=4){var ab=C("div");
	aa+="SWFObjectNew";ab.setAttribute("id",aa);ah.parentNode.insertBefore(ab,ah);ah.style.display="none";y(ah)}u(ad,ae,aa)}}function b(ab){if(O.ie&&ab.readyState!=4){ab.style.display="none";var aa=C("div");ab.parentNode.insertBefore(aa,ab);aa.parentNode.replaceChild(J(ab),aa);y(ab)}else{ab.parentNode.replaceChild(J(ab),ab)}}function J(af){var ae=C("div");if(O.win&&O.ie){ae.innerHTML=af.innerHTML}else{var ab=af.getElementsByTagName(r)[0];if(ab){var ag=ab.childNodes;if(ag){var aa=ag.length;for(var ad=0;ad<aa;ad++){if(!(ag[ad].nodeType==1&&ag[ad].nodeName=="PARAM")&&!(ag[ad].nodeType==8)){ae.appendChild(ag[ad].cloneNode(true))}}}}}return ae}function k(aa,ab){var ac=C("div");ac.innerHTML="<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'><param name='movie' value='"+aa+"'>"+ab+"</object>";return ac.firstChild}function u(ai,ag,ab){var aa,ad=c(ab);ab=W(ab);if(O.wk&&O.wk<312){return aa}if(ad){var ac=(O.ie)?C("div"):C(r),af,ah,ae;if(typeof ai.id==D){ai.id=ab}for(ae in ag){if(ag.hasOwnProperty(ae)&&ae.toLowerCase()!=="movie"){e(ac,ae,ag[ae])}}if(O.ie){ac=k(ai.data,ac.innerHTML)}for(af in ai){if(ai.hasOwnProperty(af)){ah=af.toLowerCase();if(ah==="styleclass"){ac.setAttribute("class",ai[af])}else{if(ah!=="classid"&&ah!=="data"){ac.setAttribute(af,ai[af])}}}}if(O.ie){P[P.length]=ai.id}else{ac.setAttribute("type",q);ac.setAttribute("data",ai.data)}ad.parentNode.replaceChild(ac,ad);aa=ac}return aa}function e(ac,aa,ab){var ad=C("param");ad.setAttribute("name",aa);ad.setAttribute("value",ab);ac.appendChild(ad)}function y(ac){var ab=c(ac);if(ab&&ab.nodeName.toUpperCase()=="OBJECT"){if(O.ie){ab.style.display="none";(function aa(){if(ab.readyState==4){for(var ad in ab){if(typeof ab[ad]=="function"){ab[ad]=null}}ab.parentNode.removeChild(ab)}else{setTimeout(aa,10)}}())}else{ab.parentNode.removeChild(ab)}}}function U(aa){return(aa&&aa.nodeType&&aa.nodeType===1)}function W(aa){return(U(aa))?aa.id:aa}function c(ac){if(U(ac)){return ac}var aa=null;try{aa=h.getElementById(ac)}catch(ab){}return aa}function C(aa){return h.createElement(aa)}function n(aa){return parseInt(aa,10)}function g(ac,aa,ab){ac.attachEvent(aa,ab);K[K.length]=[ac,aa,ab]}function F(ac){ac+="";var ab=O.pv,aa=ac.split(".");aa[0]=n(aa[0]);aa[1]=n(aa[1])||0;aa[2]=n(aa[2])||0;return(ab[0]>aa[0]||(ab[0]==aa[0]&&ab[1]>aa[1])||(ab[0]==aa[0]&&ab[1]==aa[1]&&ab[2]>=aa[2]))?true:false}function v(af,ab,ag,ae){var ad=h.getElementsByTagName("head")[0];if(!ad){return}var aa=(typeof ag=="string")?ag:"screen";if(ae){m=null;G=null}if(!m||G!=aa){var ac=C("style");ac.setAttribute("type","text/css");ac.setAttribute("media",aa);m=ad.appendChild(ac);if(O.ie&&typeof h.styleSheets!=D&&h.styleSheets.length>0){m=h.styleSheets[h.styleSheets.length-1]}G=aa}if(m){if(typeof m.addRule!=D){m.addRule(af,ab)}else{if(typeof h.createTextNode!=D){m.appendChild(h.createTextNode(af+" {"+ab+"}"))}}}}function w(ad,aa){if(!j){return}var ab=aa?"visible":"hidden",ac=c(ad);if(L&&ac){ac.style.visibility=ab}else{if(typeof ad==="string"){v("#"+ad,"visibility:"+ab)}}}function N(ab){var ac=/[\\\"<>\.;]/;var aa=ac.exec(ab)!=null;return aa&&typeof encodeURIComponent!=D?encodeURIComponent(ab):ab}var d=function(){if(O.ie){window.attachEvent("onunload",function(){var af=K.length;for(var ae=0;ae<af;ae++){K[ae][0].detachEvent(K[ae][1],K[ae][2])}var ac=P.length;for(var ad=0;ad<ac;ad++){y(P[ad])}for(var ab in O){O[ab]=null}O=null;for(var aa in swfobject){swfobject[aa]=null}swfobject=null})}}();return{registerObject:function(ae,aa,ad,ac){if(O.w3&&ae&&aa){var ab={};ab.id=ae;ab.swfVersion=aa;ab.expressInstall=ad;ab.callbackFn=ac;o[o.length]=ab;w(ae,false)}else{if(ac){ac({success:false,id:ae})}}},getObjectById:function(aa){if(O.w3){return z(aa)}},embedSWF:function(af,al,ai,ak,ab,ae,ad,ah,aj,ag){var ac=W(al),aa={success:false,id:ac};if(O.w3&&!(O.wk&&O.wk<312)&&af&&al&&ai&&ak&&ab){w(ac,false);M(function(){ai+="";ak+="";var an={};if(aj&&typeof aj===r){for(var aq in aj){an[aq]=aj[aq]}}an.data=af;an.width=ai;an.height=ak;var ar={};if(ah&&typeof ah===r){for(var ao in ah){ar[ao]=ah[ao]}}if(ad&&typeof ad===r){for(var am in ad){if(ad.hasOwnProperty(am)){var ap=(l)?encodeURIComponent(am):am,at=(l)?encodeURIComponent(ad[am]):ad[am];if(typeof ar.flashvars!=D){ar.flashvars+="&"+ap+"="+at}else{ar.flashvars=ap+"="+at}}}}if(F(ab)){var au=u(an,ar,al);if(an.id==ac){w(ac,true)}aa.success=true;aa.ref=au;aa.id=au.id}else{if(ae&&A()){an.data=ae;R(an,ar,al,ag);return}else{w(ac,true)}}if(ag){ag(aa)}})}else{if(ag){ag(aa)}}},switchOffAutoHideShow:function(){j=false},enableUriEncoding:function(aa){l=(typeof aa===D)?true:aa},ua:O,getFlashPlayerVersion:function(){return{major:O.pv[0],minor:O.pv[1],release:O.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(ac,ab,aa){if(O.w3){return u(ac,ab,aa)}else{return undefined}},showExpressInstall:function(ac,ad,aa,ab){if(O.w3&&A()){R(ac,ad,aa,ab)}},removeSWF:function(aa){if(O.w3){y(aa)}},createCSS:function(ad,ac,ab,aa){if(O.w3){v(ad,ac,ab,aa)}},addDomLoadEvent:M,addLoadEvent:s,getQueryParamValue:function(ad){var ac=h.location.search||h.location.hash;
	if(ac){if(/\?/.test(ac)){ac=ac.split("?")[1]}if(ad==null){return N(ac)}var ab=ac.split("&");for(var aa=0;aa<ab.length;aa++){if(ab[aa].substring(0,ab[aa].indexOf("="))==ad){return N(ab[aa].substring((ab[aa].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var aa=c(S);if(aa&&I){aa.parentNode.replaceChild(I,aa);if(p){w(p,true);if(O.ie){I.style.display="block"}}if(E){E(B)}}a=false}},version:"2.3"}}();
		var binit = false;
		var init = function( cb ){
			if(swfobject.getObjectById("ROP_client") != null){
				cb({success:true})
				return
			}
			if( !document.getElementById("rop_context") ) {
				var rop_context =  document.createElement("div");
				rop_context.id = "rop_context";
				document.getElementsByTagName("body")[0].appendChild(rop_context);
			}
			swfobject.embedSWF(ROP_FLASH_SITE+"ROPClient.swf", "rop_context", "0", "0", "11.0.0", "playerProductInstall.swf", {id:"ROP_client"}, {AllowScriptAccess:"always",wmode:"Transparent"},{id:"ROP_client",name:"ROP_client"},cb);
		}
		var jsReady=true;
		var swfReady=true;
		var pub_key_ = null;
		var sub_key_ = null;
		var clientid_ = "";
		var flash_obj = null;
		var timers = 0;
		var has_flash_init_ = false;
		window.ROP_OnPublish = function (body,socpe){
		  	eventEmit.Emit("publish_data",body,socpe);
		}
		window.ROP_EnterFail= function (err)  {
		  	eventEmit.Emit("enter_fail",err);
		}
		window.ROP_EnterSuc= function() {
		    for (var k=0; k<topic_list_.length; k++){
				if(has_flash_init_ && flash_obj)
					flash_obj.flash_Subscribe(topic_list_[k].topic,topic_list_[k].qos);
			}
			eventEmit.Emit("enter_suc");
		}
		window.ROP_SwfReady= function() {
		   swfReady = true;
		}
		window.ROP_Offline = function(){
			 eventEmit.Emit("offline");
		}
		window.ROP_Reconnecting = function(){
			 eventEmit.Emit("reconnect");
		}
		window.ROP_PageReady= function() {
		    return jsReady;
		}
		window.ROP_Losed= function() {
		   eventEmit.Emit("losed");
		}
		window.ROP_ConnectOld= function() {
		    eventEmit.Emit("connectold");
		}
		function do_init(  ){
			if(timers ++ > 500){
				eventEmit.Emit("enter_fail","flash load fail");
				return;
			}
			flash_obj = swfobject.getObjectById("ROP_client");
			if(flash_obj && flash_obj.flash_Init && swfReady){
				has_flash_init_ = true
				flash_obj.flash_Init(ICS_ADDR,1883);
				if(pub_key_ == "" || pub_key_ == null){
					pub_key_ = "----";
				}
				flash_obj.flash_Enter( pub_key_,sub_key_,clientid_ );
			}else{
				setTimeout(do_init,10);
			}
		}
		return {
			Enter:function( pub_key,sub_key ,clientid){
				pub_key_ = pub_key;
				sub_key_ = sub_key;
				if( sub_key == null )
					sub_key_ = pub_key;
				if(clientid != null){
					clientid_ = clientid;
				}
				if(!binit){
					binit = true;
					init(function( item ){
						if(item.success){
							do_init();
						}else{
							eventEmit.Emit("enter_fail","flash_init_fail");
						}
					})
				}else{
					if(has_flash_init_ && flash_obj)
						flash_obj.flash_Enter( pub_key_,sub_key_,clientid_ );
				}
			},
			Leave:function(){
				console.log("has_flash_init_ , flash_obj",has_flash_init_,flash_obj)
				if(has_flash_init_ && flash_obj)
					flash_obj.flash_Leave();
			},
			On:function(evt,func){
				eventEmit.On(evt,func)
			},
			Off:function(evt,func){
				eventEmit.Off(evt,func)
			},
			Publish:function( body ,topic ,qos,retain){
				if(has_flash_init_ && flash_obj)
					flash_obj.flash_Publish(body,topic,qos,retain);
			},
			Subscribe:function( topic,qos ){
				qos = Number(qos);
				if(qos == null) qos = 0;
				if(isNaN(qos)) qos = 0;
				if(qos > 2) qos = 2;
				if(qos < 0) qos = 0;
				topic = topic.toString();
				if(!topic || topic.length == 0)return;
				for(var k=0; k<topic_list_.length; k++){
					if(topic_list_[k].topic == topic){
						return;
					}
				}
				topic_list_.push({topic:topic,qos:qos});
				if(has_flash_init_ && flash_obj)
					flash_obj.flash_Subscribe(topic,qos);
			},
			UnSubscribe:function( topic ){
				topic = topic.toString();
				if(!topic || topic.length == 0)return;
				for(var k=0; k<topic_list_.length; k++){
					if(topic_list_[k].topic == topic){
						topic_list_.splice(k,1);
						if(has_flash_init_ && flash_obj){
							flash_obj.flash_UnSubscribe(topic);
						}
						return
					}
				}
			}
		}
	}
if(window.WebSocket){
	return WebSocketRop();
}else{
	return FlashRop();
}
}();


export default ROP; 