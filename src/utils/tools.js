/*
 *获取对象某路径下属性值
*/
const getValueByPath = function (obj, path) {
    let tempObj = obj;
    path = path.replace(/\[(\w+)\]/g, '.$1');
    path = path.replace(/^\./, '');
    let keyArr = path.split('.');
    let i = 0;
    for (let len = keyArr.length; i < len - 1; ++i) {
        let key = keyArr[i];
        if (key in tempObj) {
            tempObj = tempObj[key];
        } else {
            return undefined
        }
    }
    return tempObj[keyArr[i]]
}

/*
 *在指定对象的某属性插入值
*/
const setValueByPath = function (obj, val, path) {
    let tempObj = obj;
    path = path.replace(/\[(\w+)\]/g, '.$1');
    path = path.replace(/^\./, '');
    let keyArr = path.split('.');
    let i = 0;
    for (let len = keyArr.length; i < len; ++i) {
        let isLast = i > len - 2;
        let key = keyArr[i];
        if (isLast) {
            tempObj[key] = val
        } else {
            if (!tempObj[key] || typeof tempObj[key] != 'object') {
                tempObj[key] = isNaN(key) ? {} : [];
            }
            tempObj = tempObj[key]
        }
    }
}

/**
 * 获取随机字符
 * @return {number}
 */
function getRandomInt() {
    const num = Math.random() * 100000
    return Math.floor(num)
}

/**
 * uuid 生成
 */
function uuid() {
    var s = []
    var hexDigits = '0123456789abcdef'
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
    }
    s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = '-'
    var uuid = s.join('')
    return uuid
}

/**
 * 按指定长度生成随机字符串uuid
 * @param {长度} len 
 */
function uuid2(len = 8) {
    //ABCDEFGHIJKLMNOPQRSTUVWXYZ
    var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    let radix = chars.length;
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    return uuid.join('');
}

/**
 * 返回入参的数据类型
 *  @param {any} obj 
 */
function type(obj) {
    var toString = Object.prototype.toString;
    var map = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object'
    };
    return map[toString.call(obj)];
}

/**
 * 深拷贝
 * @param {object} data 
 */
function deepClone(data) {
    var t = type(data), o, i, ni;
    if (t === 'array') {
        o = [];
    } else if (t === 'object') {
        o = {};
    } else {
        return data;
    }
    if (t === 'array') {
        for (i = 0, ni = data.length; i < ni; i++) {
            o.push(deepClone(data[i]));
        }
        return o;
    } else if (t === 'object') {
        for (i in data) {
            o[i] = deepClone(data[i]);
        }
        return o;
    }
}
/**
 * cookie
 * @param {*} name 
 */
function getCookie(name) {
    var arr,
        reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
    if ((arr = document.cookie.match(reg))) return unescape(arr[2])
    else return null
}

/**
 * 
 * @param {*} name 
 */
function getUrlParams(name) {
    let startIndex = window.location.href.indexOf('?')
    let param = window.location.href.substr(startIndex + 1)
    let paramsObj = {}
    param = param.split('&').map(item => {
        let arr = item.split('=');
        paramsObj[arr[0]] = arr[1]
    })
    return name ? paramsObj[name] : paramsObj
}

export {
    getValueByPath,
    setValueByPath,
    getRandomInt,
    uuid,
    uuid2,
    deepClone,
    type,
    getCookie,
    getUrlParams
}