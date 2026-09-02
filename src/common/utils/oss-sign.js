/**
 * OSS/VOD 直传签名工具（自包含纯 JS，H5 与微信小程序通用）
 *
 * 用途：
 * - VOD 直传：CreateUploadVideo 返回的 UploadAuth（base64 STS 凭证 JSON）解析，
 *   配合 UploadAddress 生成 POST 表单 policy + hmac-sha1 签名，直传点播 OSS
 * - 不依赖任何第三方库与 Node API（避免小程序环境兼容问题）
 */

// ---------- base64 ----------
const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function b64Encode(bytes) {
	let out = '';
	for (let i = 0; i < bytes.length; i += 3) {
		const b0 = bytes[i];
		const b1 = bytes[i + 1];
		const b2 = bytes[i + 2];
		out += B64_CHARS[b0 >> 2];
		out += B64_CHARS[((b0 & 3) << 4) | (b1 !== undefined ? b1 >> 4 : 0)];
		if (b1 !== undefined) {
			out += B64_CHARS[((b1 & 15) << 2) | (b2 !== undefined ? b2 >> 6 : 0)];
			out += b2 !== undefined ? B64_CHARS[b2 & 63] : '=';
		} else {
			out += '==';
		}
	}
	return out;
}

function b64Decode(str) {
	const bytes = [];
	let buffer = 0;
	let bits = 0;
	for (let i = 0; i < str.length; i++) {
		const ch = str[i];
		if (ch === '=') break;
		const idx = B64_CHARS.indexOf(ch);
		if (idx < 0) continue;
		buffer = (buffer << 6) | idx;
		bits += 6;
		if (bits >= 8) {
			bits -= 8;
			bytes.push((buffer >> bits) & 0xff);
		}
	}
	return bytes;
}

// 字符串 -> UTF-8 字节
function utf8Bytes(str) {
	const bytes = [];
	for (let i = 0; i < str.length; i++) {
		let code = str.charCodeAt(i);
		if (code < 0x80) {
			bytes.push(code);
		} else if (code < 0x800) {
			bytes.push(0xc0 | (code >> 6), 0x80 | (code & 63));
		} else if (code >= 0xd800 && code <= 0xdbff) {
			const code2 = str.charCodeAt(++i);
			const c = 0x10000 + ((code & 0x3ff) << 10) + (code2 & 0x3ff);
			bytes.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
		} else {
			bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
		}
	}
	return bytes;
}

// 字节 -> 字符串（UTF-8）
function utf8String(bytes) {
	let out = '';
	for (let i = 0; i < bytes.length; i++) {
		const code = bytes[i];
		if (code < 0x80) {
			out += String.fromCharCode(code);
		} else if (code < 0xe0 && i + 1 < bytes.length) {
			out += String.fromCharCode(((code & 31) << 6) | (bytes[++i] & 63));
		} else if (code < 0xf0 && i + 2 < bytes.length) {
			out += String.fromCharCode(((code & 15) << 12) | ((bytes[++i] & 63) << 6) | (bytes[++i] & 63));
		} else if (i + 3 < bytes.length) {
			const c = ((code & 7) << 18) | ((bytes[++i] & 63) << 12) | ((bytes[++i] & 63) << 6) | (bytes[++i] & 63);
			out += String.fromCharCode(0xd800 + ((c - 0x10000) >> 10), 0xdc00 + ((c - 0x10000) & 1023));
		}
	}
	return out;
}

// ---------- SHA-1 ----------
function rol(num, cnt) {
	return (num << cnt) | (num >>> (32 - cnt));
}

function sha1(bytes) {
	const bitLen = bytes.length * 8;
	const padded = bytes.slice(0);
	padded.push(0x80);
	while (padded.length % 64 !== 56) padded.push(0);
	// SHA-1 的消息长度字段固定为 64 位大端序。之前只追加低 32 位，
	// 会把长度字节放到错误的位置，导致 HMAC-SHA1 与 OSS 计算结果不一致。
	for (let i = 7; i >= 0; i--) {
		padded.push(Math.floor(bitLen / Math.pow(2, i * 8)) & 0xff);
	}

	let h0 = 0x67452301 | 0;
	let h1 = 0xefcdab89 | 0;
	let h2 = 0x98badcfe | 0;
	let h3 = 0x10325476 | 0;
	let h4 = 0xc3d2e1f0 | 0;
	const w = new Array(80);
	for (let i = 0; i < padded.length; i += 64) {
		for (let j = 0; j < 16; j++) {
			w[j] = (padded[i + j * 4] << 24) | (padded[i + j * 4 + 1] << 16) | (padded[i + j * 4 + 2] << 8) | padded[i + j * 4 + 3];
		}
		for (let j = 16; j < 80; j++) {
			w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
		}
		let a = h0;
		let b = h1;
		let c = h2;
		let d = h3;
		let e = h4;
		for (let j = 0; j < 80; j++) {
			let temp;
			if (j < 20) {
				temp = (rol(a, 5) + ((b & c) | (~b & d)) + e + w[j] + 0x5a827999) | 0;
			} else if (j < 40) {
				temp = (rol(a, 5) + (b ^ c ^ d) + e + w[j] + 0x6ed9eba1) | 0;
			} else if (j < 60) {
				temp = (rol(a, 5) + ((b & c) | (b & d) | (c & d)) + e + w[j] + 0x8f1bbcdc) | 0;
			} else {
				temp = (rol(a, 5) + (b ^ c ^ d) + e + w[j] + 0xca62c1d6) | 0;
			}
			e = d;
			d = c;
			c = rol(b, 30);
			b = a;
			a = temp;
		}
		h0 = (h0 + a) | 0;
		h1 = (h1 + b) | 0;
		h2 = (h2 + c) | 0;
		h3 = (h3 + d) | 0;
		h4 = (h4 + e) | 0;
	}
	return [
		(h0 >>> 24) & 255, (h0 >>> 16) & 255, (h0 >>> 8) & 255, h0 & 255,
		(h1 >>> 24) & 255, (h1 >>> 16) & 255, (h1 >>> 8) & 255, h1 & 255,
		(h2 >>> 24) & 255, (h2 >>> 16) & 255, (h2 >>> 8) & 255, h2 & 255,
		(h3 >>> 24) & 255, (h3 >>> 16) & 255, (h3 >>> 8) & 255, h3 & 255,
		(h4 >>> 24) & 255, (h4 >>> 16) & 255, (h4 >>> 8) & 255, h4 & 255,
	];
}

// ---------- HMAC-SHA1 ----------
function hmacSha1(keyBytes, msgBytes) {
	const blockSize = 64;
	if (keyBytes.length > blockSize) keyBytes = sha1(keyBytes);
	const ipad = [];
	const opad = [];
	for (let i = 0; i < blockSize; i++) {
		const kb = keyBytes[i] || 0;
		ipad.push(kb ^ 0x36);
		opad.push(kb ^ 0x5c);
	}
	return sha1(opad.concat(sha1(ipad.concat(msgBytes))));
}

/**
 * base64 解码为 JSON 对象（UploadAuth/UploadAddress）
 * @param {string} base64Str
 * @returns {Object}
 */
export function decodeJson(base64Str) {
	try {
		return JSON.parse(utf8String(b64Decode(String(base64Str))));
	} catch (e) {
		return {};
	}
}

/**
 * OSS POST 表单 policy 签名（与后端 hmac_sha1 算法一致）
 * signature = base64(hmac_sha1(policy, accessKeySecret))
 * @param {string} policy base64 编码的 policy
 * @param {string} accessKeySecret
 * @returns {string}
 */
export function signPolicy(policy, accessKeySecret) {
	return b64Encode(hmacSha1(utf8Bytes(accessKeySecret), utf8Bytes(policy)));
}

/**
 * 生成 OSS POST policy（限制大小）
 * @param {string} expiration ISO8601 过期时间（如 2026-08-02T05:00:00Z）
 * @param {number} maxSize 最大字节数
 * @returns {string} base64 编码的 policy
 */
export function makePolicy(expiration, maxSize) {
	const policy = {
		expiration: expiration,
		conditions: [['content-length-range', 0, maxSize || 2147483648]],
	};
	return b64Encode(utf8Bytes(JSON.stringify(policy)));
}
