import mqtt from './mqtt.js';

var ICS_ADDR = "wxs://mqttdms.aodianyun.com/mqtt";
var arr = null
const uuid = () => {
	let s = [];
	let hexDigits = "0123456789abcdef";
	for (let i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = "-";

	var uuid = s.join("");
	return uuid;
}
function EventEmit() {
	this.callback_map_ = {}
}
EventEmit.prototype.On = function (evt, func) {
	if (typeof func != "function" || typeof evt != "string") {
		throw new Error("error arguments ");
	}
	arr = this.callback_map_[evt]
	if (arr == null) {
		arr = this.callback_map_[evt] = new Array()
	}
	arr.push(func)
}
EventEmit.prototype.Emit = function (evt, arg1, arg2) {
	arr = this.callback_map_[evt];
	if (arr == null) return;
	for (var i in arr) {
		try {
			if (arr[i]) arr[i](arg1, arg2);
		} catch (err) {
			// if (window.console){
			console.log("catch err at " + evt + " callback", err)
			// }
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
};
var eventEmit = new EventEmit()
var topic_list_ = {};
// var WebSocketRop = function() {
var pubKey_ = null;
var subKey_ = null
var mqttClient_ = null
// var useSSL_ =false;
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
function ReEnter() {
	if (timer_ != null) return;
	if (re_enter_timeout_ > reenter_max_) {
		eventEmit.Emit("losed", "")
		return;
	}
	if (state_ == STATE_ENTERED || state_ == STATE_REENTERING) {
		state_ = STATE_REENTERING;
		timer_ = setTimeout(InternalEnter, re_enter_timeout_);
		re_enter_timeout_ += reenter_df_

	}
}
function InternalSubscribe() {
	if (state_ == STATE_ENTERED) {

		mqttClient_.subscribe(topic_list_);
	}
}
function InternalUnSubscribe(topic) {
	if (state_ == STATE_ENTERED) {
		mqttClient_.unsubscribe(topic);
	}
}
function InternalEnter() {
	timer_ = null;
	if (state_ == STATE_REENTERING) {
		eventEmit.Emit("reconnect")
	}
	if (clientid_ == null) {
		clientid_ = "ws2-" + uuid()
	}

	if (mqttClient_) {
		try {
			mqttClient_.end();
		} catch (err) {

		}
	}
	try {
		mqttClient_ = mqtt.connect(ICS_ADDR,
			{
				protocolVersion: 4,
				clientId: clientid_,
				clean: false,
				username: pubKey_,
				password: subKey_,
				connectTimeout: 10 * 1000,
				keepalive: 60,
				callback: function (res) {
					console.log(res)
				}
			}
		);
	} catch (err) {
		console.log(err)
		ReEnter()
	}
	mqttClient_.on('connect', () => {
		state_ = STATE_ENTERED
		re_enter_timeout_ = reenter_df_
		// for (var i=0; i < topic_list_.length; i++){
		if (Object.keys(topic_list_).length > 0) {
			InternalSubscribe()
		}

		// }
		eventEmit.Emit("enter_suc")

	})
	mqttClient_.on('error', (err) => {
		if (state_ == STATE_ENTERING) {
			if (enter_times_++ >= 3) {
				state_ = STATE_ENTER_FAILED
				enter_times_ = 0;
				eventEmit.Emit("enter_fail", err.errorMessage)
				Leave()
			} else {

				setTimeout(InternalEnter, 1000);
			}


		} else if (state_ == STATE_REENTERING) {
			console.log(err)
			eventEmit.Emit("offline", err.errorMessage)
			ReEnter()
		}


	})
	mqttClient_.on('offline', (err) => {
		// if (responseObject.errorCode !== 0){
		eventEmit.Emit("offline", err)
		ReEnter()
		//    }
	})
	mqttClient_.on('message', (topic, message, packet) => {
		if (topic == '__sys__') {
			try {
				var msg = JSON.parse(message);
				if (msg.cmd == "kill") {

					eventEmit.Emit('connectold');
					eventEmit.Emit('losed');
					Leave();
					return;
				}
			} catch (err) {
				console.log(err)
			}
		}
		eventEmit.Emit("publish_data", message, topic)
	});
}
//window.addEventListener("unload", Leave,false);
function Leave() {
	state_ = STATE_INIT;
	enter_times_ = 0;
	clearTimeout(re_enter_timeout_);
	try {
		if (mqttClient_ && !mqttClient_.disconnecting) {
			mqttClient_.end()
			eventEmit.Emit('losed');
		}
	} catch (err) {

	}
}
// return {
var ROP = {
	Enter: function (pubKey, subKey, clientid) {
		if (state_ == STATE_INIT) {
			state_ = STATE_ENTERING;
			pubKey_ = pubKey;
			subKey_ = subKey;
			if (!!subKey_) {
				subKey_ = pubKey
			}
			if (!!clientid) {
				clientid_ = clientid;
			}
			InternalEnter();
		}
	},
	Leave: Leave,
	On: function (evt, func) {
		eventEmit.On(evt, func)
	},
	Off: function (evt, func) {
		eventEmit.Off(evt, func)
	},
	Publish: function (body, topic/*  ,qos,retain */) {
		if (state_ === STATE_ENTERED) {

			mqttClient_.publish(topic, body, {
				qos:/*  Number(qos) || */ 0,
				retain: /* retain ||  */false
			})
		}
	},
	Subscribe: function (topic, qos) {
		topic = topic.toString();
		qos = Number(qos);
		if (qos == null) qos = 0;
		if (isNaN(qos)) qos = 0;
		if (qos > 2) qos = 2;
		if (qos < 0) qos = 0;
		if (!topic || topic.length == 0) return;
		// for(var k=0; k < topic_list_.length; k++){
		if (topic_list_[topic]) {
			return;
		}
		// }

		topic_list_[topic] = { qos: qos }
		InternalSubscribe();
	},
	UnSubscribe: function (topic) {
		topic = topic.toString();
		if (!topic || topic.length == 0) return;
		// for(var k=0; k<topic_list_.length; k++){
		if (topic_list_[topic]) {
			delete topic_list_[topic]
			InternalUnSubscribe(topic);
			return
		}
		// }

	}
}

// }
// }


// WebSocketRop();

export default ROP; 