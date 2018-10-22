/*
    弹出层(移动端)
    作者：yxs
    项目地址：https://github.com/i-yxs/layxs
*/
(function (window) {
    'use strict';
    /**
     * 让IE浏览器支持document.currentScript
     */
    if (document.currentScript === undefined) {
        document.currentScript = (function () {
            var src = '';
            var stack;
            try {
                //强制报错,以便捕获e.stack
                a.b.c();
            } catch (e) {
                //safari的错误对象只有line,sourceId,sourceURL
                stack = e.stack;
                if (!stack && window.opera) {
                    //opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
                    stack = (String(e).match(/of linked script \S+/g) || []).join(' ');
                }
            }
            if (stack) {
                //取得最后一行,最后一个空格或@之后的部分
                stack = stack.split(/[@ ]/g).pop();
                stack = stack[0] == '(' ? stack.slice(1, -1) : stack;
                //去掉行号与或许存在的出错字符起始位置
                src = stack.replace(/(:\d+)?:\d+$/i, '');
            } else {
                var nodes = document.getElementsByTagName('script');
                for (var i = 0, node; node = nodes[i++];) {
                    if (node.readyState === 'interactive') {
                        src = node.src;
                        break;
                    }
                }
            }
            return { src: src };
        })();
    }
    /*
     *  常用功能
     */
    function oftenFunc() { }; 
    oftenFunc.prototype = {
        //获取对象指定key的值
        get: function (obj, path) {
            var res;
            var reg1 = /\d+/;
            var reg2 = /([^.\[\]]+)|(?=\[)(\d+)(?=\])/g;
            path = path || '';
            path.split('.').every(function (item) {
                while (res = reg2.exec(item)) {
                    if (obj === null || obj === undefined) {
                        return obj = undefined, false;
                    } else {
                        obj = obj[res[1]];
                    }
                }
                return true;
            });
            return obj;
        },
        //设置对象指定key的值(对象,属性名or属性路径,值)
        set: function (obj, path, value) {
            var res, prev, temp;
            var reg1 = /\d+/;
            var reg2 = /([^.\[\]]+)|(?=\[)(\d+)(?=\])/g;
            path = path || '';
            path.split('.').forEach(function (item) {
                while (res = reg2.exec(item)) {
                    if (temp) {
                        //匹配到的值为数字则是数组，否则为对象
                        if (reg1.test(res[1]) && oftenFunc.type(temp[prev]) !== 'array') {
                            temp[prev] = [];
                        } else if (oftenFunc.type(temp[prev]) !== 'object') {
                            temp[prev] = {};
                        }
                        temp = temp[prev];
                    } else {
                        temp = obj;
                    }
                    prev = res[1];
                }
            });
            return temp[prev] = value;
        },
        //判断指定对象的数据类型
        type: function (obj, name) {
            var toString = Object.prototype.toString.call(obj).toLowerCase();
            if (name) {
                return toString === '[object ' + name.toLowerCase() + ']';
            } else {
                return /^\[object (\w+)\]$/.exec(toString)[1];
            }
        },
        //对象克隆(克隆者,是否使用深克隆模式)
        clone: function (obj, isDepth) {
            var newobj;
            switch (oftenFunc.type(obj)) {
                case 'array':
                    newobj = []; break;
                case 'object':
                    newobj = {};
                    break;
                default:
                    return obj;
            }
            Object.keys(obj).forEach(function (name) {
                if (isDepth) {
                    newobj[name] = oftenFunc.clone(obj[name], isDepth);
                } else {
                    newobj[name] = obj[name];
                }
            });
            return newobj;
        },
        //数组去重(数组对象,比对指定路径的值)
        unique: function (list, path) {
            var value;
            var newList = [];
            var tempList = [];
            list.forEach(function (item, index) {
                value = oftenFunc.get(item, path);
                if (tempList.indexOf(value) === -1) {
                    newList.push(item);
                }
                tempList.push(value);
            });
            return newList;
        },
        //对象继承(继承者,被继承者,是否继承所有属性,是否使用深继承模式)
        extend: function (heres, byheres, isAll, isDepth) {
            Object.keys(byheres).forEach(function (name) {
                if (!isAll && heres[name] !== undefined) {
                    return;
                }
                if (isDepth) {
                    switch (oftenFunc.type(byheres[name])) {
                        case 'array':
                            if (oftenFunc.type(heres[name]) !== 'array') {
                                heres[name] = [];
                            }
                            oftenFunc.extend(heres[name], byheres[name], isAll, isDepth);
                            break;
                        case 'object':
                            if (oftenFunc.type(heres[name]) !== 'object') {
                                heres[name] = {};
                            }
                            oftenFunc.extend(heres[name], byheres[name], isAll, isDepth);
                            break;
                        default:
                            heres[name] = byheres[name];
                            break;
                    }
                } else {
                    heres[name] = byheres[name];
                }
            });
            return heres;
        },
        //数组检索(数组对象,比对的值,比对指定路径的值)
        indexOf: function (list, value, path) {
            var index = -1;
            list.forEach(function (item, i) {
                if (value === oftenFunc.get(item, path)) {
                    index = i;
                }
            });
            return index;
        },
        //判断是否为 undefined | null | '' 中的任意一个
        isEmpty: function (val) {
            if (val === '' || val === null || val === undefined) {
                return true;
            }
            return false;
        },
        //获取url参数
        getParams: function (name) {
            var res, reg = new RegExp('[?&]' + name + '=([^&=]+)', 'i');
            if (res = reg.exec(location.search)) {
                return RegExp.$1;
            }
            return '';
        },
        //对象转url参数
        toUrlParams: function (obj) {
            var search = '';
            Object.keys(obj).forEach(function (name, index) {
                if (obj[name] !== undefined) {
                    search += index ? '&' : '';
                    search += name + '=' + obj[name];
                }
            });
            return search;
        },
        //url参数转对象
        toUrlObject: function () {
            var url = arguments[0] || location.href;
            var index = url.indexOf('?');
            var jsons = {};
            if (index > -1) {
                var search = url.substr(index + 1, url.length).split('&');
                search.forEach(function (item) {
                    var strs = item.split('=');
                    jsons[strs[0] || ''] = decodeURI(strs[1] || '');
                });
            }
            return jsons;
        },
        //操作cookie
        cookie: {
            //获取cookie
            get: function (key) {
                var arr, reg = new RegExp('(^| )' + key + '=([^;]*)(;|$)');
                if (arr = document.cookie.match(reg)) {
                    return unescape(arr[2]);
                }
            },
            //设置cookie，exp以小时为单位
            set: function (key, value, exp) {
                var date = new Date();
                exp = (exp || 24) * 60 * 60 * 1000;
                date.setTime(date.getTime() + exp);
                document.cookie = key + '=' + escape(value) + ';expires=' + date.toGMTString();
            },
            //删除cookie
            del: function (key) {
                var exp = new Date();
                var cval = this.getCookie(key);
                exp.setTime(exp.getTime() - 1);
                if (cval != null) {
                    document.cookie = key + '=' + cval + ';expires=' + exp.toGMTString();
                }
            },
        },
        //操作localStorage
        localStorage: {
            //获取localStorage值，exp以小时为单位
            getItem: function (key, exp) {
                var data = JSON.parse(localStorage.getItem(key));
                if (data && data.startdate) {
                    exp = (exp && exp * 60 * 60 * 1000) || Infinity;
                    if (Date.now() - data.startdate <= exp) {
                        return JSON.parse(data.context);
                    }
                }
                return null;
            },
            //设置localStorage值
            setItem: function (key, value) {
                localStorage.setItem(key, JSON.stringify({ context: value, startdate: Date.now() }));
            },
        },
    };
    oftenFunc = new oftenFunc();
    /*
     *  dom常用功能
     */
    function oftenDomFunc() {
        var that = this;
        //事件处理
        that.event = {};
        //自定义数据key名
        that.keyName = '__custom_key_name_dom_' + Date.now() + '__';
        //css3兼容前缀
        that.browserPrefix = '-webkit- -moz- -o- -ms-'.split(' ');
        //css3兼容列表
        that.browserAttr = 'transform transition animation'.split(' ');
        //绑定
        that.bind = function (el) {
            var that = this;
            for (var name in that) {
                if (!that.hasOwnProperty(name)) {
                    el[name] = that[name].bind(el);
                }
            }
            return el;
        };
        //解除绑定
        that.unbind = function (el) {
            var that = this;
            for (var name in that) {
                if (!that.hasOwnProperty(name)) {
                    delete el[name];
                }
            }
            return el;
        };
        //获取当前事件目标的冒泡路径，可使用选择器进行筛选
        that.getEventAgencyTarget = function (selector) {
            var that = this;
            if (event.srcElement) {
                var list = that.getParents.call(event.srcElement);
                if (selector) {
                    var list1 = [];
                    var list2 = Array.prototype.slice.call(document.querySelectorAll(selector));
                    list.forEach(function (item) {
                        if (list2.indexOf(item) > -1) {
                            list1.push(item);
                        }
                    });
                    return list1;
                } else {
                    return list;
                }
            }
            return [];
        };
    };
    oftenDomFunc.prototype = {
        //事件绑定
        on: function (name, callback) {
            var that = this;
            var data = oftenFunc.get(that, oftenDomFunc.keyName + '.event');
            name = name.toLowerCase();
            data = data || oftenFunc.set(that, oftenDomFunc.keyName + '.event', {});
            data[name] = data[name] || [];
            data[name].push(callback);
            if (oftenDomFunc.event[name]) {
                oftenDomFunc.event[name].on(that, name, callback);
            } else {
                that.addEventListener.apply(that, arguments);
            }
            return that;
        },
        //解除事件绑定
        off: function (name, callback) {
            var that = this;
            var data = oftenFunc.get(that, oftenDomFunc.keyName + '.event');
            name = name.toLowerCase();
            if (data && data[name]) {
                data = data[name];
                if (callback === undefined) {
                    data.forEach(function (callback) {
                        if (oftenDomFunc.event[name]) {
                            oftenDomFunc.event[name].off(that, name, callback);
                        } else {
                            that.removeEventListener(name, callback);
                        }
                    });
                    data.length = 0;
                } else {
                    var index = data.indexOf(callback);
                    if (index > -1) {
                        data.splice(index, 1);
                        if (oftenDomFunc.event[name]) {
                            oftenDomFunc.event[name].off(that, name, callback);
                        } else {
                            that.removeEventListener.apply(that, arguments);
                        }
                    }
                }
            }
            return that;
        },
        //设置样式
        css: function () {
            var that = this;
            var data = {};
            var name = arguments[0];
            switch (oftenFunc.type(name)) {
                case 'string':
                    if (arguments[1] === undefined) {
                        var style = getComputedStyle(that, arguments[2]);
                        if (/^([0-9.]+)px$/i.test(style[name])) {
                            return Number(RegExp.$1);
                        }
                        return style[name];
                    } else {
                        data[name] = arguments[1];
                    }
                    break;
                case 'object':
                    data = name;
                    break;
            }
            Object.keys(data).forEach(function (name) {
                if (oftenDomFunc.browserAttr.indexOf(name) > -1) {
                    oftenDomFunc.browserPrefix.forEach(function (prefix) {
                        that.style[prefix + name] = data[name];
                    });
                }
                that.style[name] = data[name];
            });
            return that;
        },
        //设置属性
        attr: function () {
            var that = this;
            var option = arguments[0];
            switch (oftenFunc.type(option)) {
                case 'string':
                    if (arguments[1] === undefined) {
                        return that.getAttribute(option);
                    } else {
                        that.setAttribute(option, arguments[1]);
                    }
                    break;
                case 'object':
                    Object.keys(option).forEach(function (name) {
                        that.setAttribute(name, option[name]);
                    });
                    break;
            }
            return that;
        },
        //删除自己
        remove: function () {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
            return this;
        },
        //获取所有祖先元素，可使用选择器进行筛选
        parents: function (selector) {
            var that = this;
            var list = oftenDomFunc.getParents.call(that);
            list.splice(0, 1);
            if (selector) {
                var list1 = [];
                var list2 = Array.prototype.slice.call(document.querySelectorAll(selector));
                list.forEach(function (item) {
                    if (list2.indexOf(item) > -1) {
                        list1.push(item);
                    }
                });
                return list1;
            }
            return list;
        },
        //判断是否具有指定样式类
        hasClass: function (name) {
            var that = this;
            var list = that.className.split(' ');
            var lenght = list.length;
            name = name.toLowerCase();
            for (var i = 0; i < lenght; i++) {
                if (name === list[i].toLowerCase()) {
                    return true;
                }
            }
            return false;
        },
        //添加样式类
        addClass: function (name) {
            var that = this;
            var list = that.className.split(' ');
            name.split(' ').forEach(function (item) {
                if (list.indexOf(item) === -1) {
                    list.push(item);
                }
            });
            that.className = list.join(' ');
            return that;
        },
        //删除样式类
        removeClass: function (name) {
            var that = this;
            var list1 = [];
            var list2 = name.split(' ');
            that.className.split(' ').forEach(function (item) {
                if (list2.indexOf(item) === -1) {
                    list1.push(item);
                }
            });
            that.className = list1.join(' ');
            return that;
        },
        //获取祖先列表
        getParents: function () {
            var that = this;
            var path = [that];
            var parent = that.parentNode;
            while (parent && parent !== document) {
                path.push(parent);
                parent = parent.parentNode;
            }
            return path;
        },
        //获取前一个兄弟节点
        getBeforeSibling: function () {
            var that = this;
            if (that.parentNode) {
                var list = Array.prototype.slice.call(that.parentNode.children);
                var index = list.indexOf(that);
                if (index < list.length - 1) {
                    return list[index + 1];
                }
            }
            return null;
        },
        //获取后一个兄弟节点
        getAfterSibling: function () {
            var that = this;
            if (that.parentNode) {
                var list = Array.prototype.slice.call(that.parentNode.children);
                var index = list.indexOf(that);
                if (index > 0) {
                    return list[index - 1];
                }
            }
            return null;
        },
    };
    oftenDomFunc = new oftenDomFunc();
    //tap事件处理
    oftenDomFunc.event.tap = {
        //手指按下到提起的最大间隔时间，超出则不触发事件
        interval: 1000,
        //手指按下到提起的最大移动距离，超出则不触发事件
        threshold: 20,
        //手指按下事件处理
        down: function (e) {
            var that = this;
            var data = that[oftenDomFunc.keyName].event.$tap;
            data.position = {
                clientX: e.touches[0].clientX,
                clientY: e.touches[0].clientY,
                identifier: e.touches[0].identifier,
            };
            data.timestamp = Date.now();
        },
        //手指提起事件处理
        lift: function (e) {
            var that = this;
            var data = that[oftenDomFunc.keyName].event;
            var interval = oftenDomFunc.event.tap.interval;
            var threshold = oftenDomFunc.event.tap.threshold;
            if (data.$tap.position) {
                if (Date.now() - data.$tap.timestamp < interval) {
                    var position;
                    if (e.changedTouches[0].identifier === data.$tap.position.identifier) {
                        position = {
                            clientX: e.changedTouches[0].clientX,
                            clientY: e.changedTouches[0].clientY,
                            identifier: e.changedTouches[0].identifier,
                        };
                    }
                    if (Math.abs(data.$tap.position.clientX - position.clientX) < threshold &&
                        Math.abs(data.$tap.position.clientY - position.clientY) < threshold) {
                        data.tap.forEach(function (item) {
                            item.call(that, e);
                        });
                    }
                }
                data.$tap.position = null;
                data.$tap.timestamp = null;
                e.preventDefault();
            }
        },
        //绑定事件
        on: function (el, name, callback) {
            var data = el[oftenDomFunc.keyName].event;
            if ('ontouchstart' in document) {
                if (data.$tap === undefined) {
                    data.$tap = {
                        position: null,
                        timestamp: null,
                        downCache: oftenDomFunc.event.tap.down.bind(el),
                        liftCache: oftenDomFunc.event.tap.lift.bind(el),
                    };
                    el.addEventListener('touchstart', data.$tap.downCache);
                    el.addEventListener('touchend', data.$tap.liftCache);
                }
            } else {
                el.addEventListener('click', callback);
            }
        },
        //解除绑定
        off: function (el, name, callback) {
            var data = el[oftenDomFunc.keyName].event;
            if ('ontouchstart' in document) {
                if (data[name].length === 0 && data.$tap) {
                    el.removeEventListener('touchstart', data.$tap.downCache);
                    el.removeEventListener('touchend', data.$tap.liftCache);
                    data.$tap = undefined;
                }
            } else {
                el.removeEventListener('click', callback);
            }
        },
    };
    //拖拽事件处理
    oftenDomFunc.event.drag = {
        //手指按下事件处理
        down: function (e) {
            var that = this;
            if (e.button) {
                return;
            }
            e.preventDefault();
            var data = that[oftenDomFunc.keyName].event;
            if ('ontouchstart' in document) {
                data.$drag.position = {
                    clientX: e.touches[0].clientX,
                    clientY: e.touches[0].clientY,
                    timestamp: Date.now(),
                    identifier: e.touches[0].identifier,
                };
            } else {
                data.$drag.position = {
                    clientX: e.clientX,
                    clientY: e.clientY,
                    timestamp: Date.now(),
                };
            }
            data.$drag.movepath = [data.$drag.position];
            data.drag.forEach(function (item) {
                item.call(that, {
                    state: 1,
                    event: e,
                    moveX: 0,
                    moveY: 0,
                    speed: { x: 0, y: 0 },
                    currentTarget: that,
                });
            });
        },
        //手指移动事件处理
        move: function (e) {
            var that = this;
            var data = that[oftenDomFunc.keyName].event;
            if (data.$drag.position) {
                var position;
                if ('ontouchstart' in document) {
                    Array.prototype.forEach.call(e.touches, function (item) {
                        if (item.identifier === data.$drag.position.identifier) {
                            position = {
                                clientX: item.clientX,
                                clientY: item.clientY,
                                timestamp: Date.now(),
                                identifier: item.identifier,
                            };
                        }
                    });
                } else {
                    position = {
                        clientX: e.clientX,
                        clientY: e.clientY,
                        timestamp: Date.now(),
                    };
                }
                if (position) {
                    data.$drag.movepath.push(position);
                    var moveX = data.$drag.position.clientX - position.clientX,
                        moveY = data.$drag.position.clientY - position.clientY;
                    data.drag.forEach(function (item) {
                        item.call(that, {
                            state: 2,
                            event: e,
                            moveX: moveX,
                            moveY: moveY,
                            speed: { x: 0, y: 0 },
                            currentTarget: that,
                        });
                    });
                }
                e.preventDefault();
            }
        },
        //手指提起事件处理
        lift: function (e) {
            var that = this;
            if (e.button) {
                return;
            }
            var data = that[oftenDomFunc.keyName].event;
            if (data.$drag.position) {
                var position;
                if ('ontouchstart' in document) {
                    if (e.changedTouches[0].identifier === data.$drag.position.identifier) {
                        position = {
                            clientX: e.changedTouches[0].clientX,
                            clientY: e.changedTouches[0].clientY,
                            timestamp: Date.now(),
                            identifier: e.changedTouches[0].identifier,
                        };
                    }
                } else {
                    position = {
                        clientX: e.clientX,
                        clientY: e.clientY,
                        timestamp: Date.now(),
                    };
                }
                if (position) {
                    data.$drag.movepath.push(position);
                    var moveX = data.$drag.position.clientX - position.clientX,
                        moveY = data.$drag.position.clientY - position.clientY;
                    data.drag.forEach(function (item) {
                        item.call(that, {
                            state: 3,
                            event: e,
                            moveX: moveX,
                            moveY: moveY,
                            speed: oftenDomFunc.event.drag.getMoveSpeed(data.$drag.movepath, 100),
                            currentTarget: that,
                        });
                    });
                }
                data.$drag.position = null;
                e.preventDefault();
            }
        },
        //获取指定毫秒数内移动的速度(路径列表,毫秒数)
        getMoveSpeed: function (path, time) {
            var speed = { x: 0, y: 0 };
            var length = path.length;
            if (length > 1) {
                if (Date.now() - path[length - 1].timestamp < time) {
                    var isfind = false;
                    var newpos = path[length - 1];
                    var timestamp = newpos.timestamp - time;
                    for (var i = length - 1,
                        item,
                        ratio,
                        maxpos; i >= 0; i--) {
                        item = path[i];
                        if (item.timestamp === timestamp) {
                            isfind = true;
                            speed.x = newpos.clientX - item.clientX;
                            speed.y = newpos.clientY - item.clientY;
                            break;
                        } else if (item.timestamp < timestamp) {
                            isfind = true;
                            maxpos = path[i + 1];
                            ratio = (timestamp - item.timestamp) / (maxpos.timestamp - item.timestamp);
                            speed.x = newpos.clientX - ((maxpos.clientX - item.clientX) * ratio + item.clientX);
                            speed.y = newpos.clientY - ((maxpos.clientY - item.clientY) * ratio + item.clientY);
                            break;
                        }
                    }
                    if (!isfind) {
                        ratio = (newpos.timestamp - path[0].timestamp) / time;
                        speed.x = (newpos.clientX - path[0].clientX) / ratio;
                        speed.y = (newpos.clientY - path[0].clientY) / ratio;
                    }
                }
            }
            return speed;
        },
        //绑定事件
        on: function (el, name, callback) {
            var data = el[oftenDomFunc.keyName].event;
            if (data.$drag === undefined) {
                data.$drag = {
                    position: null,
                    movepath: null,
                    downCache: oftenDomFunc.event.drag.down.bind(el),
                    moveCache: oftenDomFunc.event.drag.move.bind(el),
                    liftCache: oftenDomFunc.event.drag.lift.bind(el),
                };
                if ('ontouchstart' in document) {
                    el.addEventListener('touchstart', data.$drag.downCache, { passive: false });
                    window.addEventListener('touchmove', data.$drag.moveCache, { passive: false });
                    window.addEventListener('touchend', data.$drag.liftCache, { passive: false });
                } else {
                    el.addEventListener('mousedown', data.$drag.downCache, { passive: false });
                    window.addEventListener('mousemove', data.$drag.moveCache, { passive: false });
                    window.addEventListener('mouseup', data.$drag.liftCache, { passive: false });
                }
            }
        },
        //解除绑定
        off: function (el, name, callback) {
            var data = el[oftenDomFunc.keyName].event;
            if (data.$drag) {
                if ('ontouchstart' in document) {
                    el.removeEventListener('touchstart', data.$drag.downCache);
                    window.removeEventListener('touchmove', data.$drag.moveCache);
                    window.removeEventListener('touchend', data.$drag.liftCache);
                } else {
                    el.removeEventListener('mousedown', data.$drag.downCache);
                    window.removeEventListener('mousemove', data.$drag.moveCache);
                    window.removeEventListener('mouseup', data.$drag.liftCache);
                }
            }
            data.$drag = undefined;
        },
    };
    //滚轮事件处理
    oftenDomFunc.event.wheel = {
        //当前环境是否为火狐浏览器
        isFirefox: /(firefox)\/([\w.]+)/i.test(navigator.userAgent),
        //鼠标滚轮事件处理
        wheel: function (e) {
            var that = this;
            var data = that[oftenDomFunc.keyName].event;
            var wheelDeltaX = e.wheelDeltaX || 0;
            var wheelDeltaY = e.wheelDeltaY || 0;
            var wheelDeltaZ = e.wheelDeltaZ || 0;
            if (oftenDomFunc.event.wheel.isFirefox) {
                wheelDeltaY = (-e.detail) || 0;
            }
            if (wheelDeltaX > 0) { wheelDeltaX = -1 }
            else if (wheelDeltaX < 0) { wheelDeltaX = 1 }
            if (wheelDeltaY > 0) { wheelDeltaY = -1 }
            else if (wheelDeltaY < 0) { wheelDeltaY = 1 }
            if (wheelDeltaZ > 0) { wheelDeltaZ = -1 }
            else if (wheelDeltaZ < 0) { wheelDeltaZ = 1 }
            data.wheel.forEach(function (item) {
                item.call(that, {
                    event: e,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    wheelDeltaX: wheelDeltaX,
                    wheelDeltaY: wheelDeltaY,
                    wheelDeltaZ: wheelDeltaZ,
                    currentTarget: that,
                });
            });
        },
        //绑定事件
        on: function (el, name, callback) {
            var data = el[oftenDomFunc.keyName].event;
            if (data.$tap === undefined) {
                data.$tap = {
                    wheelCache: oftenDomFunc.event.wheel.wheel.bind(el),
                };
                if (oftenDomFunc.event.wheel.isFirefox) {
                    el.addEventListener('DOMMouseScroll', data.$tap.wheelCache);
                } else {
                    el.addEventListener('mousewheel', data.$tap.wheelCache);
                }
            }
        },
        //解除绑定
        off: function (el, name, callback) {
            var data = el[oftenDomFunc.keyName].event;
            if (data.$wheel) {
                if (oftenDomFunc.event.wheel.isFirefox) {
                    el.removeEventListener('DOMMouseScroll', data.$wheel.wheelCache);
                } else {
                    el.removeEventListener('mousewheel', data.$wheel.wheelCache);
                }
                data.$wheel = undefined;
            }
        },
    };
    /*
     *  事件推送
     */
    function EventPush() { };
    EventPush.prototype = {
        //自定义数据key名
        keyName: '__custom_key_name_event_' + Date.now() + '__',
        //注册事件推送
        add: function (obj) {
            var that = this;
            oftenFunc.set(obj, that.keyName + '.event', {});
            obj.on = that.addEvent.bind(obj);
            obj.off = that.removeEvent.bind(obj);
            obj.emit = that.dispatchEvent.bind(obj);
        },
        //添加事件
        addEvent: function (name, callback) {
            var that = this;
            var data = that[EventPush.keyName].event;
            name = name.toLowerCase();
            data[name] = data[name] || [];
            data[name].push(callback);
            //通知注册目标进行了添加事件操作
            that.emit('$on', {
                name: name,
                callback: callback
            });
            return that;
        },
        //删除事件
        removeEvent: function (name, callback) {
            var that = this;
            var data = that[EventPush.keyName].event[name.toLowerCase()];
            if (data) {
                //如果没有传入回调函数，则删除所有事件
                if (callback === undefined) {
                    data.length = 0;
                } else {
                    var index = data.indexOf(callback);
                    if (index > -1) {
                        data.splice(index, 1);
                    }
                }
                //通知注册目标进行了删除事件操作
                that.emit('$off', {
                    name: name,
                    callback: callback
                });
            }
            return that;
        },
        //发送事件
        dispatchEvent: function (name, letter, isHump) {
            var that = this;
            var data = that[EventPush.keyName].event[name.toLowerCase()];
            if (data) {
                data.forEach(function (item) {
                    item.call(that, letter);
                });
            }
            //派送驼峰写法的事件
            if (isHump) {
                var humpName = 'on' + name[0].toUpperCase() + name.toLowerCase().substring(1);
                that[humpName].call(that, letter);
            }
            return that;
        },
    };
    EventPush = new EventPush();
    EventPush.add(EventPush);
    /*
     *  字符串算式计算
     */
    var equation = {
        unit: {
            vw: 'window.innerWidth',
            vh: 'window.innerHeight',
        },
        calc: function (exp, custom) {
            Object.keys(equation.unit).forEach(function (name) {
                exp = exp.replace(name, equation.unit[name]);
            });
            if (oftenFunc.type(custom) === 'object') {
                Object.keys(custom).forEach(function (name) {
                    exp = exp.replace(name, custom[name]);
                });
            }
            try {
                return Number(eval(exp));
            } catch (e) {
                return NaN;
            }
        }
    };
    /*
     *  弹出层
     */
    function Layer(option) {
        var that = this;
        //注册监听器
        EventPush.add(that);
        //计时器列表
        that.timerlist = {};
        //元素缓存
        that.elementCache = {};
        //当前配置
        that.currentConfig = oftenFunc.clone(that.defaultConfig, true);
        oftenFunc.extend(that.currentConfig, option, true, true);
        //生成元素
        var wrapper = document.createElement('div');
        wrapper.innerHTML = '\
            <div class="layxs-layer-wrap" data-show="0">\
                <div class="ly-mask-wrap"></div>\
                <div class="ly-view-wrap ly-flex">\
                    <div class="ly-head-wrap ly-flex">\
                        <div class="ly-title"></div>\
                        <div class="ly-close"></div>\
                    </div>\
                    <div class="ly-body-wrap"></div>\
                    <div class="ly-func-wrap"></div>\
                </div>\
            </div>\
        ';
        that.elementCache['mask'] = oftenDomFunc.bind(wrapper.querySelector('.ly-mask-wrap'));
        that.elementCache['view'] = oftenDomFunc.bind(wrapper.querySelector('.ly-view-wrap'));
        that.elementCache['head'] = oftenDomFunc.bind(wrapper.querySelector('.ly-head-wrap'));
        that.elementCache['title'] = oftenDomFunc.bind(wrapper.querySelector('.ly-title'));
        that.elementCache['close'] = oftenDomFunc.bind(wrapper.querySelector('.ly-close'));
        that.elementCache['body'] = oftenDomFunc.bind(wrapper.querySelector('.ly-body-wrap'));
        that.elementCache['func'] = oftenDomFunc.bind(wrapper.querySelector('.ly-func-wrap'));
        that.elementCache['layer'] = oftenDomFunc.bind(wrapper.querySelector('.layxs-layer-wrap'));
        //绑定事件
        that.elementCache['close'].on('tap', function () {
            that.close();
        });
        that.elementCache['mask'].on('tap', function () {
            if (that.currentConfig.tapMaskClose) {
                that.close();
            }
        });
        that.elementCache['func'].on('tap', function () {
            if (that.currentConfig.btnEvent) {
                var el = oftenDomFunc.getEventAgencyTarget('.ly-btn')[0];
                if (el) {
                    var index = Number(el.getAttribute('data-index'));
                    that.currentConfig.btnEvent.call(that, index);
                }
            }
        });
        that.updatePosition = that.updatePosition.bind(that);
        oftenDomFunc.on.call(window, 'resize', that.updatePosition);
        //是否关闭其他弹框
        if (that.currentConfig.isCloseOther) {
            layxs.close();
        }
    };
    //显示
    Layer.prototype.show = function (option) {
        var that = this;
        that.update(option);
        that.elementCache['layer'].attr('data-show', 1);
        that.timerlist['show'] = Date.now();
        return that;
    };
    //关闭
    Layer.prototype.close = function () {
        var that = this;
        //停止自动关闭计时器
        clearTimeout(that.timerlist['duration']);
        if (that.elementCache['layer'].attr('data-show') == 1 && that.currentConfig.transition) {
            that.elementCache['layer'].attr('data-show', 0).on('transitionend', function () {
                if (that.currentConfig.isCloseAfteDestroy) {
                    that.destroy();
                }
                that.elementCache['layer'].off('transitionend').remove();
            });
        }
        that.emit('close');
        return that;
    };
    //更新
    Layer.prototype.update = function (option) {
        var that = this;
        if (option) {
            oftenFunc.extend(that.currentConfig, option, true, true);
        }
        that.emit('updatebefore');
        that.updateConfig();
        if (that.elementCache['layer'].parentNode !== that.currentConfig.parentElement) {
            that.currentConfig.parentElement.appendChild(that.elementCache['layer']);
        }
        that.updatePosition();
        return that;
    };
    //销毁
    Layer.prototype.destroy = function () {
        var that = this;
        that.emit('destroy');
        if (that.elementCache['content-parent-node']) {
            if (that.elementCache['content-next-sbiling-node']) {
                that.elementCache['content-parent-node'].insertBefore(that.elementCache['content-node'], that.elementCache['content-next-sbiling-node']);
            } else {
                that.elementCache['content-parent-node'].appendChild(that.elementCache['content-node']);
            }
        }
        that.elementCache['content-node'] = null;
        that.elementCache['content-parent-node'] = null;
        that.elementCache['content-next-sbiling-node'] = null;
        that.elementCache['mask'].off('tap');
        that.elementCache['func'].off('tap');
        that.elementCache['close'].off('tap');
        oftenDomFunc.off.call(window, 'resize', that.updatePosition);
        return that;
    };
    //更新当前配置
    Layer.prototype.updateConfig = function () {
        var that = this;
        var config = that.currentConfig;
        if (config.title === null) {
            that.elementCache['head'].addClass('ly-hide');
        } else {
            that.elementCache['title'].innerHTML = config.title;
            that.elementCache['head'].removeClass('ly-hide');
        }
        if (config.isCloseBtn) {
            that.elementCache['close'].removeClass('ly-hide');
        } else {
            that.elementCache['close'].addClass('ly-hide');
        }
        if (config.content === null) {
            that.elementCache['view'].addClass('ly-hide');
        } else if (config.content !== that.elementCache['content-node']) {
            if (config.content.nodeType === 1) {
                that.elementCache['content-node'] = config.content;
                that.elementCache['content-parent-node'] = config.content.parentNode;
                that.elementCache['content-next-sbiling-node'] = oftenDomFunc.getBeforeSibling.call(config.content);
                that.elementCache['body'].appendChild(config.content);
            } else if (typeof config.content === 'object') {
                that.elementCache['body'].innerHTML = JSON.stringify(config.content);
            } else {
                that.elementCache['body'].innerHTML = config.content;
            }
            that.elementCache['view'].removeClass('ly-hide');
        }
        if (config.boxback) {
            that.elementCache['view'].css('background', config.boxback);
        } else {
            that.elementCache['view'].css('background', '#fff');
        }
        if (config.button) {
            var html = '';
            config.button.forEach(function (item, i) {
                html += '<div data-index="' + i + '" class="ly-btn">' + item + '</div>';
            });
            that.elementCache['func'].removeClass('ly-hide').innerHTML = html;
        } else {
            that.elementCache['func'].addClass('ly-hide');
        }
        if (config.isMask) {
            that.elementCache['mask'].style.backgroundColor = config.maskColor;
            that.elementCache['mask'].removeClass('ly-hide');
        } else {
            that.elementCache['mask'].addClass('ly-hide');
        }
        that.elementCache['func'].attr('data-align', config.btnAlign);
        that.elementCache['view'].css('border-radius', config.borderRadius);
        that.elementCache['layer'].attr({
            'data-mode': config.module,
            'data-transition': config.transition
        });
        if (config.duration) {
            clearTimeout(that.timerlist['duration']);
            that.timerlist['duration'] = setTimeout(function () {
                that.close();
            }, config.duration);
        }
        return that;
    };
    //更新显示位置
    Layer.prototype.updatePosition = function () {
        var that = this;
        var config = that.currentConfig;
        var area = {};
        var reg1 = '(\\d+)%$';
        var reg2 = 'calc\\((\\S+)\\)';
        var reg3 = '^(([+-]?)\\d*\\.?\\d+)$';
        var parseValue = function (value, maxSize, rule) {
            if (new RegExp(reg3).test(value)) {
                return Number(RegExp.$1);
            } else if (new RegExp(reg2, 'ig').test(value)) {
                return equation.calc(RegExp.$1, rule);
            } else if (new RegExp(reg1).test(value)) {
                return RegExp.$1 / 100 * maxSize;
            }
        };
        //使用元素克隆对象计算位置
        var replica = that.elementCache['layer'].cloneNode(true);
        var replicaView = replica.querySelector('.ly-view-wrap');
        var parentElement = that.currentConfig.parentElement === window ? document.body : that.currentConfig.parentElement;
        oftenDomFunc.attr.call(replica, { 'data-show': 1 });
        oftenDomFunc.css.call(replicaView, { top: 0, left: 0, width: 'auto', height: 'auto', transition: 'none', });
        parentElement.insertBefore(replica, parentElement.firstChild);
        //最小宽度
        area.minWidth = parseValue(config.area.minWidth, window.innerWidth) || 0;
        area.minHeight = parseValue(config.area.minHeight, window.innerHeight) || 0;
        area.maxWidth = parseValue(config.area.maxWidth, window.innerWidth) || window.innerWidth;
        area.maxHeight = parseValue(config.area.maxHeight, window.innerHeight) || window.innerHeight;
        area.minWidth = Math.min(area.minWidth, area.maxWidth);
        area.minHeight = Math.min(area.minHeight, area.maxHeight);
        area.maxWidth = Math.max(area.minWidth, area.maxWidth);
        area.maxHeight = Math.max(area.minHeight, area.maxHeight);
        //宽度
        switch (config.area.width) {
            case 'full':
                area.width = window.innerWidth;
                break;
            default:
                area.width = parseValue(config.area.width, window.innerWidth) || replicaView.clientWidth;
                break;
        }
        //宽度可能会出现浮点数，但是clientWidth只能获取整数，所以这里统一加1
        area.width = Math.max(Math.min(area.width, area.maxWidth), area.minWidth) + 1;
        replicaView.style.width = area.width + 'px';
        //高度
        switch (config.area.height) {
            case 'full':
                area.height = window.innerHeight;
                break;
            default:
                area.height = parseValue(config.area.height, window.innerHeight) || replicaView.clientHeight;
                break;
        }
        area.height = Math.max(Math.min(area.height, area.maxHeight), area.minHeight);
        replicaView.style.height = area.height + 'px';
        //水平定位
        switch (config.area.h) {
            case 'left':
                area.left = 0;
                break;
            case 'right':
                area.left = window.innerWidth - area.width;
                break;
            default:
                area.left = parseValue(config.area.h, window.innerWidth, {
                    'bw': area.width,
                    'left': 0,
                    'right': window.innerWidth - area.width
                }) || 0;
                area.left -= area.width / 2;
                break;
        }
        //垂直定位
        switch (config.area.v) {
            case 'top':
                area.top = 0;
                break;
            case 'bottom':
                area.top = window.innerHeight - area.height;
                break;
            default:
                area.top = parseValue(config.area.v, window.innerHeight, {
                    'bh': area.height,
                    'top': 0,
                    'bottom': window.innerHeight - area.height
                }) || 0;
                area.top -= area.height / 2;
                break;
        }
        that.emit('updateing', {
            rect: area,
            view: replicaView,
        });
        oftenDomFunc.remove.call(replica);
        that.elementCache['view'].css({
            top: area.top + 'px',
            left: area.left + 'px',
            width: area.width + 'px',
            height: area.height + 'px',
        });
        return that;
    };
    //默认配置
    Layer.prototype.defaultConfig = {
        //模块
        module: '',
        //标题
        title: null,
        //内容
        content: null,
        //背景
        boxback: '#fff',
        //圆角
        borderRadius: '3px',
        //显示的时间(number:毫秒|false:一直显示)
        duration: 0,
        //按钮列表 Array(string|number,...)
        button: null,
        //按钮事件列表 Function
        btnEvent: null,
        //按钮排列方式 String('h'：横排 | 'v'：竖排)
        btnAlign: 'h',
        //指定显示的区域
        area: {
            h: '50%',
            v: '50%'
        },
        //是否显示关闭按钮
        isCloseBtn: true,
        //是否显示遮罩层
        isMask: true,
        //遮罩层颜色
        maskColor: 'rgba(0,0,0,.6)',
        //点击遮罩层是否关闭消息框
        tapMaskClose: true,
        //父容器
        parentElement: document.body,
        //显示和关闭时的过渡动画
        transition: 'popup',
        //创建时自动显示
        isAutoShow: true,
        //是否关闭其他弹框
        isCloseOther: false,
        //关闭后是否自动销毁对象
        isCloseAfteDestroy: true,
    };
    /*
     *  消息框
     */
    function Msg(option) {
        var that = this;
        Layer.call(that, option);
        that.on('updatebefore', function () {
            that.currentConfig.content = '<div class="ly-msg">' + that.currentConfig.text + '</div>';
        });
        if (that.currentConfig.isAutoShow) {
            that.show();
        }
    };
    oftenFunc.extend(Msg.prototype, Layer.prototype, true, true);
    oftenFunc.extend(Msg.prototype.defaultConfig, {
        text: '',
        area: {
            'maxWidth': '60%',
            'maxHeight': '60%'
        },
        module: 'msg',
        boxback: 'rgba(0,0,0,.8)',
        borderRadius: '4px',
        duration: 2000,
        isMask: false
    }, true, true);
    /*
     *  遮罩层
     */
    function Mask(option) {
        var that = this;
        Layer.call(that, option);
        if (that.currentConfig.isAutoShow) {
            that.show();
        }
    };
    oftenFunc.extend(Mask.prototype, Layer.prototype, true, true);
    /*
     *  tips
     */
    function Tips(option) {
        var that = this;
        Layer.call(that, option);
        that.on('updatebefore', function () {
            that.currentConfig.title = null;
            that.currentConfig.button = [];
            that.currentConfig.content = '<div class="ly-tips" style="border-color:' + that.currentConfig.boxback + '">' + that.currentConfig.text + '</div>';
            var parentElement = that.getScrollNode();
            if (that.currentConfig.autoLocate) {
                oftenDomFunc.on.call(parentElement, 'scroll', that.updatePosition);
                oftenDomFunc.off.call(that.currentConfig.parentElement, 'scroll', that.updatePosition);
            }
            that.currentConfig.parentElement = parentElement;
            that.elementCache['layer'].css('zIndex', Number(oftenDomFunc.css.call(that.currentConfig.adsorbElement, 'zIndex')) || 1);
        });
        that.on('updateing', function (data) {
            that.updateLocate(data.view, data.rect);
        });
        that.on('destroy', function () {
            oftenDomFunc.off.call(that.currentConfig.parentElement, 'scroll', that.updatePosition);
        });
        if (that.currentConfig.isAutoShow) {
            that.show();
        }
    };
    oftenFunc.extend(Tips.prototype, Layer.prototype, true, true);
    oftenFunc.extend(Tips.prototype.defaultConfig, {
        text: '',
        //显示方向(如果指定方向无法显示完整，则按照top right bottom left顺序依次计算，如果没有一个方向能显示完整，则使用指定方向显示)
        direction: 'top',
        //吸附元素
        adsorbElement: null,
        //自动设置显示方位
        autoLocate: true,
        area: {
            'minWidth': 0,
            'maxWidth': 220,
        },
        module: 'tips',
        boxback: 'rgba(0,0,0,.8)',
        borderRadius: '3px',
        duration: 2000,
        isMask: false
    }, true, true);
    //更新
    Tips.prototype.update = function (option) {
        var that = this;
        if (option) {
            oftenFunc.extend(that.currentConfig, option, true, true);
        }
        that.emit('updatebefore');
        that.updateConfig();
        var parentElement = that.currentConfig.parentElement === window ? document.body : that.currentConfig.parentElement;
        if (that.elementCache['layer'].parentNode !== parentElement) {
            var existingnode = parentElement.firstChild;
            Array.prototype.slice.call(parentElement.children).every(function (item) {
                if (!oftenDomFunc.hasClass.call(item, 'layxs-layer-wrap')) {
                    return existingnode = item, false;
                }
                return true;
            });
            parentElement.insertBefore(that.elementCache['layer'], existingnode);
        }
        that.updatePosition();
        return that;
    };
    //获取吸附元素相对于父容器的位置
    Tips.prototype.getToOffset = function () {
        var that = this;
        var adsorbElement = that.currentConfig.adsorbElement;
        var parentElement = that.currentConfig.parentElement === window ? document.body : that.currentConfig.parentElement;
        var offset = {
            top: adsorbElement.offsetTop,
            left: adsorbElement.offsetLeft,
        };
        var path = oftenDomFunc.getParents.call(adsorbElement);
        path.length = Math.max(path.indexOf(parentElement), 0);
        path.splice(0, 1);
        path.forEach(function (item) {
            //相对和绝对定位，会影响offset
            if (/relative|absolute|fixed/.test(oftenDomFunc.css.call(item, 'position'))) {
                offset.top += item.offsetTop;
                offset.left += item.offsetLeft;
            }
        });
        offset.top -= that.elementCache['layer'].offsetTop;
        offset.left -= that.elementCache['layer'].offsetLeft;
        return offset;
    };
    //更新显示方位
    Tips.prototype.updateLocate = function (replicaView, viewRect) {
        var that = this;
        var corner = 10;
        var locate = '';
        var offset = that.getToOffset();
        offset.width = that.currentConfig.adsorbElement.clientWidth;
        offset.height = that.currentConfig.adsorbElement.clientHeight;
        var keyList = ['t0', 't1', 't2', 'r0', 'r1', 'r2', 'b0', 'b1', 'b2', 'l0', 'l1', 'l2'];
        var isFull = function (direc) {
            switch (direc) {
                case 't0':
                    viewRect.top = offset.top - viewRect.height - corner;
                    viewRect.left = offset.left;
                    break;
                case 't1':
                    viewRect.top = offset.top - viewRect.height - corner;
                    viewRect.left = offset.left - (viewRect.width - offset.width) / 2;
                    break;
                case 't2':
                    viewRect.top = offset.top - viewRect.height - corner;
                    viewRect.left = offset.left - viewRect.width + offset.width;
                    break;
                case 'r0':
                    viewRect.top = offset.top;
                    viewRect.left = offset.left + offset.width + corner;
                    break;
                case 'r1':
                    viewRect.top = offset.top - (viewRect.height - offset.height) / 2;
                    viewRect.left = offset.left + offset.width + corner;
                    break;
                case 'r2':
                    viewRect.top = offset.top - viewRect.height + offset.height;
                    viewRect.left = offset.left + offset.width + corner;
                    break;
                case 'b0':
                    viewRect.top = offset.top + offset.height + corner;
                    viewRect.left = offset.left;
                    break;
                case 'b1':
                    viewRect.top = offset.top + offset.height + corner;
                    viewRect.left = offset.left - (viewRect.width - offset.width) / 2;
                    break;
                case 'b2':
                    viewRect.top = offset.top + offset.height + corner;
                    viewRect.left = offset.left - viewRect.width + offset.width;
                    break;
                case 'l0':
                    viewRect.top = offset.top;
                    viewRect.left = offset.left - viewRect.width - corner;
                    break;
                case 'l1':
                    viewRect.top = offset.top - (viewRect.height - offset.height) / 2;
                    viewRect.left = offset.left - viewRect.width - corner;
                    break;
                case 'l2':
                    viewRect.top = offset.top - viewRect.height + offset.height;
                    viewRect.left = offset.left - viewRect.width - corner;
                    break;
            }
            oftenDomFunc.css.call(replicaView, {
                top: viewRect.top + 'px',
                left: viewRect.left + 'px',
            });
            var rect1 = replicaView.getBoundingClientRect();
            if (that.currentConfig.parentElement === window) {
                var rect2 = that.elementCache['layer'].getBoundingClientRect();
                rect2.width = window.innerWidth - rect2.left;
                rect2.height = window.innerHeight - rect2.top;
            } else {
                var rect2 = that.currentConfig.parentElement.getBoundingClientRect();
            }
            if (rect1.left > 0 &&
                rect1.top > 0 &&
                rect1.left + rect1.width < window.innerWidth &&
                rect1.top + rect1.height < window.innerHeight &&
                rect1.left > rect2.left &&
                rect1.top > rect2.top &&
                rect1.right < rect2.width + rect2.left &&
                rect1.bottom < rect2.height + rect2.top) {
                return true;
            }
            return false;
        };
        if (that.currentConfig.autoLocate) {
            keyList.splice(0, 0, keyList.splice(keyList.indexOf(that.currentConfig.direction + '0'), 1)[0]);
            keyList.splice(1, 0, keyList.splice(keyList.indexOf(that.currentConfig.direction + '1'), 1)[0]);
            keyList.splice(2, 0, keyList.splice(keyList.indexOf(that.currentConfig.direction + '2'), 1)[0]);
            keyList.every(function (name) {
                if (isFull(name)) {
                    return locate = name, false;
                }
                return true;
            });
            if (locate === '') {
                locate = that.currentConfig.direction + '0';
                isFull(locate);
            }
        } else {
            locate = that.currentConfig.direction + '0';
            isFull(locate);
        }
        that.elementCache['layer'].attr('data-locate', locate);
    };
    //获取吸附元素向上冒泡路径第一个可以滚动的父元素
    Tips.prototype.getScrollNode = function () {
        var that = this;
        var node = window;
        oftenDomFunc.getParents.call(that.currentConfig.adsorbElement).every(function (item) {
            if (/auto|scroll/.test(oftenDomFunc.css.call(item, 'overflow')) ||
                /fixed/.test(oftenDomFunc.css.call(item, 'position'))) {
                return node = item, false;
            }
            return true;
        });
        return node;
    };
    /*
     *  弹出框
     */
    function Open(option) {
        var that = this;
        Layer.call(that, option);
        if (that.currentConfig.isAutoShow) {
            that.show();
        }
    };
    oftenFunc.extend(Open.prototype, Layer.prototype, true, true);
    oftenFunc.extend(Open.prototype.defaultConfig, {
        area: {
            'maxWidth': '80%',
            'maxHeight': '80%',
        },
        module: 'open',
        isScroll: true,
        tapMaskClose: false
    }, true, true);
    /*
     *  提示框
    */
    function Alert(option) {
        var that = this;
        Layer.call(that, option);
        that.on('updatebefore', function () {
            that.currentConfig.content = '<div class="ly-alert">' + that.currentConfig.text + '</div>';
        });
        if (that.currentConfig.isAutoShow) {
            that.show();
        }
    };
    oftenFunc.extend(Alert.prototype, Layer.prototype, true, true);
    oftenFunc.extend(Alert.prototype.defaultConfig, {
        text: '',
        area: {
            'v': '40%',
            'minWidth': '200',
            'maxWidth': '60%',
            'maxHeight': '60%',
        },
        module: 'alert',
        button: ['确定'],
        btnEvent: function () {
            this.close();
        },
        borderRadius: '3px',
        isCloseOther: false,
        isCloseAfteDestroy: true
    }, true, true);
    /*
     *  输入框
     */
    function Prompt(option) {
        var that = this;
        Layer.call(that, option);

        var content = document.createElement('div');
        content.className = 'ly-prompt';
        content.innerHTML = '<div class="ly-text"></div><input class="ly-input">';
        that.elementCache['text'] = content.querySelector('.ly-text');
        that.elementCache['input'] = content.querySelector('.ly-input');

        that.on('updatebefore', function () {
            that.currentConfig.content = content;
            that.elementCache['text'].innerText = that.currentConfig.text;
            oftenDomFunc.attr.call(that.elementCache['input'], {
                type: that.currentConfig.inputType,
                placeholder: that.currentConfig.placeholder,
            });
        });
        if (that.currentConfig.isAutoShow) {
            that.show();
        }
    };
    oftenFunc.extend(Prompt.prototype, Layer.prototype, true, true);
    oftenFunc.extend(Prompt.prototype.defaultConfig, {
        text: '',
        placeholder: '',
        area: {
            'v': '40%',
            'minWidth': '200',
            'maxWidth': '80%',
            'maxHeight': '80%'
        },
        module: 'prompt',
        //回调函数
        callback: null,
        //自定义验证函数
        verify: null,
        //输入类型
        inputType: 'text',
        isCloseBtn: true,
        tapMaskClose: false,
        button: ['取消', '确定'],
        btnEvent: function (idx) {
            switch (idx) {
                case 0:
                    this.close();
                    break;
                case 1:
                    this.confirm();
                    break;
            }
        }
    }, true, true);
    //确认输入回调处理
    Prompt.prototype.confirm = function () {
        var that = this;
        var input = that.elementCache['body'].querySelector('.ly-input')
        if (oftenFunc.type(that.currentConfig.callback) === 'function') {
            var val = input.value;
            if (oftenFunc.type(that.currentConfig.verify) === 'function') {
                var result = that.currentConfig.verify(val);
                if (result === true) {
                    that.currentConfig.callback.call(that, val);
                } else {
                    layxs.tips({
                        text: result,
                        direction: 't',
                        adsorbElement: input,
                        autoLocate: false,
                    });
                }
            } else {
                that.currentConfig.callback.call(that, val);
            }
        }
    };
    /*
     *  询问框
     */
    function Confirm(option) {
        var that = this;
        Layer.call(that, option);
        that.on('updatebefore', function () {
            that.currentConfig.content = '<div class="ly-confirm">' + that.currentConfig.text + '</div>';
        });
        if (that.currentConfig.isAutoShow) {
            that.show();
        }
    };
    oftenFunc.extend(Confirm.prototype, Layer.prototype, true, true);
    oftenFunc.extend(Confirm.prototype.defaultConfig, {
        text: '',
        area: {
            'v': '40%',
            'minWidth': '200',
            'maxWidth': '60%',
            'maxHeight': '60%'
        },
        module: 'confirm',
        button: ['否', '是'],
        btnEvent: function () {
            this.close();
        },
        btnAlign: 'h',
        borderRadius: '3px',
        isCloseBtn: true,
        tapMaskClose: false
    }, true, true);
    /*
     *  加载提示
     */
    function Loading(option) {
        var that = this;
        Layer.call(that, option);

        var content = document.createElement('div');
        content.className = 'ly-loading';
        content.innerHTML = '<div class="ly-icon ly-icon-loading"></div><div class="ly-text"></div>';
        that.elementCache['text'] = content.querySelector('.ly-text');

        that.on('updatebefore', function () {
            that.currentConfig.content = content;
            if (oftenFunc.isEmpty(that.currentConfig.text)) {
                oftenDomFunc.addClass.call(that.elementCache['text'], 'ly-hide');
            } else {
                oftenDomFunc.removeClass.call(that.elementCache['text'], 'ly-hide');
                that.elementCache['text'].innerText = that.currentConfig.text;
            }
        });
        if (that.currentConfig.isAutoShow) {
            that.show();
        }
    };
    oftenFunc.extend(Loading.prototype, Layer.prototype, true, true);
    oftenFunc.extend(Loading.prototype.defaultConfig, {
        text: '',
        area: {
            'maxWidth': '140'
        },
        module: 'loading',
        boxback: 'rgba(0,0,0,.8)',
        maskColor: 'transparent',
        borderRadius: '3px',
        tapMaskClose: false
    }, true, true);
    //入口
    var layxs = {
        //历史
        history: [],
        //模块列表
        module: {},
        //自增id
        indexId: 0,
        //初始化
        init: function () {
            var that = this;
            that.module['msg'] = Msg;
            that.module['mask'] = Mask;
            that.module['tips'] = Tips;
            that.module['open'] = Open;
            that.module['alert'] = Alert;
            that.module['prompt'] = Prompt;
            that.module['confirm'] = Confirm;
            that.module['loading'] = Loading;
            //加入样式文件
            var link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.href = document.currentScript.src.replace(/\/[^/]+$/, '/layxs.css');
            document.head.appendChild(link);
            return that;
        },
        //关闭所有或指定id的弹框
        close: function (id) {
            var that = this;
            if (id === undefined) {
                that.history.forEach(function (item) {
                    item.close();
                });
                that.history = [];
            } else {
                var index = oftenFunc.indexOf(that.history, id, 'id');
                if (index > -1) {
                    that.history.splice(index, 1).close();
                }
            }
        },
        //设置默认配置
        config: function (name, option) {
            var that = this;
            var obj = that.module[name];
            if (obj) {
                Object.keys(option).forEach(function (name) {
                    if (name in obj.prototype.defaultConfig) {
                        obj.prototype.defaultConfig[name] = option[name];
                    }
                });
            }
            return that;
        },
    };
    //消息框
    layxs.msg = function () {
        var that = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.type(option)) {
            case 'object':
                config = option;
                break;
            default:
                config = {
                    text: option
                };
                if (arguments[1] !== undefined) {
                    config.duration = arguments[1];
                }
                break;
        }
        if (config.text !== null) {
            var box = new Msg(config);
            box.id = that.indexId++;
            that.history.push(box);
            return box;
        }
    };
    //遮罩层
    layxs.mask = function () {
        var that = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.type(option)) {
            case 'object':
                config = option;
                break;
            default:
                config = {
                    maskColor: option
                };
                break;
        }
        var box = new Mask(config);
        box.id = that.indexId++;
        that.history.push(box);
        return box;
    };
    //tips
    layxs.tips = function () {
        var that = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.type(option)) {
            case 'object':
                config = option;
                break;
            default:
                config = {
                    text: option
                };
                if (arguments[1] !== undefined) {
                    config.adsorbElement = arguments[1];
                }
                if (arguments[2] !== undefined) {
                    config.direction = arguments[2];
                }
                if (arguments[3] !== undefined) {
                    config.duration = arguments[3];
                }
                break;
        }
        if (config.text !== null) {
            var box = new Tips(config);
            box.id = that.indexId++;
            that.history.push(box);
            return box;
        }
    };
    //页面弹出框
    layxs.open = function () {
        var that = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.type(option)) {
            case 'object':
                config = option;
                break;
            default:
                config = {
                    content: option
                };
                if (arguments[1] !== undefined) {
                    config.title = arguments[1];
                }
                break;
        }
        if (config.content !== null) {
            var box = new Open(config);
            box.id = that.indexId++;
            that.history.push(box);
            return box;
        }
    };
    //提示框
    layxs.alert = function () {
        var that = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.type(option)) {
            case 'object':
                config = option;
                break;
            default:
                config = {
                    text: option
                };
                break;
        }
        if (config.text !== null) {
            var box = new Alert(config);
            box.id = that.indexId++;
            that.history.push(box);
            return box;
        }
    };
    //输入框
    layxs.prompt = function () {
        var that = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.type(option)) {
            case 'object':
                config = option;
                break;
            default:
                config = {
                    text: option
                };
                if (oftenFunc.type(arguments[1]) === 'function') {
                    config.callback = arguments[1];
                }
                break;
        }
        if (config.text !== null) {
            var box = new Prompt(config);
            box.id = that.indexId++;
            that.history.push(box);
            return box;
        }
    };
    //询问框
    layxs.confirm = function () {
        var that = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.type(option)) {
            case 'object':
                config = option;
                break;
            default:
                config = {
                    text: option
                };
                if (oftenFunc.type(arguments[1]) === 'function') {
                    config.btnEvent = arguments[1];
                }
                break;
        }
        if (config.text !== null) {
            var box = new Confirm(config);
            box.id = that.indexId++;
            that.history.push(box);
            return box;
        }
    };
    //加载提示
    layxs.loading = function () {
        var that = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.type(option)) {
            case 'object':
                config = option;
                break;
            default:
                config = {
                    text: option
                };
                break;
        }
        var box = new Loading(config);
        box.id = that.indexId++;
        that.history.push(box);
        return box;
    };
    //暴露入口
    window.layxs = layxs.init();
})(window);