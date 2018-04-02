/*
    弹出层(移动端)
    作者：yxs
    项目地址：https://github.com/qq597392321/layxs
*/
(function (window) {
    'use strict'
    var CUSTOM_DATA_KEY_NAME = 'CUSTOM_DATA_KEY_' + Date.now() + '';
    //常用功能
    var oftenFunc = {
        //获取对象指定key的值
        get: function (obj, tier) {
            tier = tier ? tier.split('.') : [];
            try {
                tier.forEach(function (name) {
                    obj = obj[name];
                });
                return obj;
            } catch (e) { }
        },
        //设置对象指定key的值
        set: function (obj, tier, value) {
            var temp = obj;
            tier = tier ? tier.split('.') : [];
            tier.forEach(function (name) {
                if (oftenFunc.isType(temp[name], 'object')) {
                    temp = temp[name];
                } else {
                    temp = temp[name] = {};
                }
            });
            return (temp = value), obj;
        },
        //对象克隆
        clone: function (obj) {
            var newobj = null;
            switch (oftenFunc.isType(obj)) {
                case 'array':
                    newobj = [];
                    obj.forEach(function (item, i) {
                        newobj[i] = oftenFunc.clone(item);
                    });
                    break;
                case 'object':
                    newobj = {};
                    Object.keys(obj).forEach(function (name) {
                        newobj[name] = oftenFunc.clone(obj[name]);
                    });
                    break;
                default: return obj;
            }
            return newobj;
        },
        //判断指定对象的数据类型
        isType: function (obj, name) {
            var toString = Object.prototype.toString.call(obj).toLowerCase();
            if (name === undefined) {
                return /^\[object (\w+)\]$/.exec(toString)[1];
            } else {
                return toString === '[object ' + name.toLowerCase() + ']';
            }
        },
        //数组去重
        unique: function (list, tier) {
            var value;
            var dellist = [];
            var templist = [];
            list.forEach(function (item, i) {
                value = oftenFunc.get(item, tier);
                if (templist.indexOf(value) > -1) {
                    dellist.push(i);
                } else {
                    templist.push(value);
                }
            });
            for (var i = dellist.length - 1; i >= 0; i--) {
                list.splice(dellist[i], 1);
            }
            return list;
        },
        //indexOf增强版，可以指定多级属性
        indexOf: function (list, value, tier) {
            var index = -1;
            list.forEach(function (item, i) {
                if (value === oftenFunc.get(item, tier)) {
                    index = i;
                }
            });
            return index;
        },
        //对象继承(指定继承对象，指定继承自对象，当继承对象已存在属性，是否用新的值覆盖旧的值(可选，默认false))
        extend: function (target, obj, isrep) {
            Object.keys(obj).forEach(function (name) {
                if (target[name] !== undefined && !isrep) return;
                target[name] = obj[name];
            });
        },
        //深度对象继承
        deepExtend: function (target, obj, isrep) {
            Object.keys(obj).forEach(function (name) {
                if (oftenFunc.isType(obj[name], 'object') && oftenFunc.isType(target[name], 'object')) {
                    oftenFunc.deepExtend(target[name], obj[name], isrep);
                } else {
                    if (target[name] !== undefined && !isrep) return;
                    target[name] = obj[name];
                }
            });
        },
        //绑定上下文(指定对象，指定上下文对象)
        bindContext: function (obj, context) {
            var type = oftenFunc.isType(obj);
            if (type === 'object' || type === 'function') {
                Object.keys(obj).forEach(function (name) {
                    switch (oftenFunc.isType(obj[name])) {
                        case 'function':
                            obj[name] = obj[name].bind(context);
                            break;
                        case 'object':
                            oftenFunc.bindContext(obj[name], context);
                            break;
                    }
                });
            }
        },
    };
    /*
        事件推送
    */
    var eventPush = {
        //注册
        register: function (obj) {
            var s = this;
            var tier = CUSTOM_DATA_KEY_NAME + '.custom-event';
            if (!oftenFunc.get(obj, tier)) {
                oftenFunc.set(obj, tier, {});
                obj.on = s.addEvent.bind(obj);
                obj.off = s.removeEvent.bind(obj);
                obj.dispatchEvent = s.dispatchEvent.bind(obj);
            }
        },
        //取消注册
        destroy: function (obj) {
            var key = ['on', 'off', 'dispatchEvent'];
            key.forEach(function (name) {
                delete obj[name];
            });
        },
        //派送事件
        dispatchEvent: function (name, letter) {
            var s = this;
            var data = s[CUSTOM_DATA_KEY_NAME]['custom-event'];
            if (oftenFunc.isType(name, 'string')) {
                name = name.toLowerCase();
                if (data[name]) {
                    data[name].forEach(function (item) {
                        item.call(s, letter);
                    });
                }
                var humpName = 'on' + name[0].toUpperCase() + name.substring(1);
                if (oftenFunc.isType(s[humpName], 'function')) {
                    s[humpName].call(s, letter);
                }
            }
        },
        //添加事件
        addEvent: function (name, callback) {
            var s = this;
            var data = s[CUSTOM_DATA_KEY_NAME]['custom-event'];
            if (oftenFunc.isType(name, 'string') &&
                oftenFunc.isType(callback, 'function')) {
                name = name.toLowerCase();
                (data[name] = data[name] || []).push(callback);
            }
        },
        //删除事件
        removeEvent: function (name, callback) {
            var s = this;
            var data = s[CUSTOM_DATA_KEY_NAME]['custom-event'];
            if (oftenFunc.isType(name, 'string')) {
                name = name.toLowerCase();
                if (callback === undefined) {
                    data[name] = [];
                } else {
                    var index = data[name].indexOf(callback);
                    if (index > -1) {
                        data[name].splice(index, 1);
                    }
                }
            }
        }
    };
    //dom常用功能封装
    var oftenDomFunc = {
        //tap事件处理
        tapEvent: {
            isTouch: 'ontouchstart' in document,
            interval: 1000,
            threshold: 20,
            init: function (element) {
                element[CUSTOM_DATA_KEY_NAME]['dom-event']['tap-data'] = {
                    'is-init': true,
                    'is-bind': false,
                    'down-position': null,
                    'down-timestamp': null,
                    'down-dispose': oftenDomFunc.tapEvent.down.bind(element),
                    'lift-dispose': oftenDomFunc.tapEvent.lift.bind(element)
                };
            },
            down: function (e) {
                var s = this;
                var data = s[CUSTOM_DATA_KEY_NAME]['dom-event']['tap-data'];
                data['down-position'] = {
                    clientX: e.changedTouches[0].clientX,
                    clientY: e.changedTouches[0].clientY
                };
                data['down-timestamp'] = Date.now();
            },
            lift: function (e) {
                var s = this;
                var data = s[CUSTOM_DATA_KEY_NAME]['dom-event']['tap-data'];
                var downpos = data['down-position'];
                var downtime = data['down-timestamp'];
                if (downpos) {
                    if (Date.now() - downtime < oftenDomFunc.tapEvent.interval) {
                        var currpos = {
                            clientX: e.changedTouches[0].clientX,
                            clientY: e.changedTouches[0].clientY
                        };
                        if (Math.abs(downpos.clientX - currpos.clientX) < oftenDomFunc.tapEvent.threshold &&
                            Math.abs(downpos.clientY - currpos.clientY) < oftenDomFunc.tapEvent.threshold) {
                            s[CUSTOM_DATA_KEY_NAME]['dom-event']['tap'].forEach(function (item) {
                                item.call(s, e);
                            });
                        }
                    }
                    data['down-position'] = null;
                    data['down-timestamp'] = null;
                }
            }
        },
        //css3兼容前缀
        browserPrefix: ['-webkit-', '-moz-', '-o-', '-ms-'],
        //css3兼容列表
        browserAttrList: ['transform', 'transition', 'animation', 'clipPath'],
        //不继承方法列表
        extendExceptList: ['browserPrefix', 'browserAttrList', 'extendExceptList', 'extend', 'destroy', 'tapEvent'],
        //继承
        extend: function (element) {
            var keylist = Object.keys(oftenDomFunc);
            oftenDomFunc.extendExceptList.forEach(function (name) {
                keylist.splice(keylist.indexOf(name), 1);
            });
            keylist.forEach(function (name) {
                element[name] = oftenDomFunc[name].bind(element);
            });
            //队列数据
            oftenFunc.set(element, CUSTOM_DATA_KEY_NAME + '.dom-queue', {
                //默认队列
                'def': {
                    //队列数据列表
                    list: [],
                    //计时器id
                    timerid: null
                }
            });
            //事件列表
            oftenFunc.set(element, CUSTOM_DATA_KEY_NAME + '.dom-event', {});
            return element;
        },
        //取消继承
        destroy: function (element) {
            var keylist = Object.keys(oftenDomFunc);
            oftenDomFunc.extendExceptList.forEach(function (name) {
                keylist.splice(keylist.indexOf(name), 1);
            });
            keylist.forEach(function (name) {
                delete element[name];
            });
        },
        //设置样式
        css: function () {
            var s = this;
            var option = arguments[0];
            switch (oftenFunc.isType(option)) {
                case 'string':
                    if (arguments[1] === undefined) {
                        return oftenDomFunc.getStyle.call(s, option);
                    } else {
                        s.style[option] = arguments[1];
                    }
                    break;
                case 'object':
                    Object.keys(option).forEach(function (name) {
                        if (oftenDomFunc.browserAttrList.indexOf(name) > -1) {
                            oftenDomFunc.browserPrefix.forEach(function (prefix) {
                                s.style[prefix + name] = option[name];
                            });
                        }
                        s.style[name] = option[name];
                    });
                    break;
            }
            return s;
        },
        //设置属性
        attr: function () {
            var s = this;
            var option = arguments[0];
            switch (oftenFunc.isType(option)) {
                case 'string':
                    if (arguments[1] === undefined) {
                        return s.getAttribute(option);
                    } else {
                        s.setAttribute(option, arguments[1]);
                    }
                    break;
                case 'object':
                    Object.keys(option).forEach(function (name) {
                        s.setAttribute(name, option[name]);
                    });
                    break;
            }
            return s;
        },
        //删除自己
        remove: function () {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
            return this;
        },
        //获取指定选择器的祖先元素列表
        parents: function (selector) {
            var s = this;
            var list = [];
            var path = s.getAncestor();
            [].forEach.call(document.querySelectorAll(selector), function (item) {
                if (path.indexOf(item) > -1) {
                    list.push(item);
                }
            });
            return list;
        },
        //判断是否具有指定样式类
        hasClass: function (name) {
            var list = this.className.split(' ');
            name = name.toLowerCase();
            for (var i = list.length - 1; i >= 0; i--) {
                if (name = list[i].toLowerCase()) {
                    return true;
                }
            }
            return false;
        },
        //添加样式类
        addClass: function (name) {
            var list1 = name.split(' ');
            var list2 = this.className.split(' ');
            list1.forEach(function (item, i) {
                var index = list2.indexOf(item);
                if (index === -1) {
                    list2.push(item);
                }
            });
            this.className = list2.join(' ');
            return this;
        },
        //删除样式类
        removeClass: function (name) {
            var list1 = name.split(' ');
            var list2 = this.className.split(' ');
            list1.forEach(function (item) {
                var index = list2.indexOf(item);
                if (index > -1) {
                    list2.splice(index, 1);
                }
            });
            this.className = list2.join(' ');
            return this;
        },
        //获取冒泡路径
        getPath: function () {
            var s = this;
            var path = [s];
            var node = s.parentNode;
            while (node) {
                path.push(node);
                node = node.parentNode;
            }
            return path;
        },
        //获取指定样式值，像素值只会返回数字
        getStyle: function (name, pseudoElt) {
            var style = getComputedStyle(this, pseudoElt);
            if (/^([0-9.]+)px$/i.test(style[name])) {
                return Number(RegExp.$1);
            }
            return style[name];
        },
        //获取所有祖先元素
        getAncestor: function () {
            var s = this;
            var list = s.getPath();
            list.splice(0, 1);
            return list;
        },
        //获取下一个兄弟节点
        getNextSbiling: function () {
            var s = this;
            if (this.parentNode) {
                var list = [].slice.call(this.parentNode.children);
                var index = list.indexOf(s);
                if (index <= list.length) {
                    return list[index + 1];
                }
            }
        },
        //获取上一个兄弟节点
        getPreviousSbiling: function () {
            var s = this;
            if (this.parentNode) {
                var list = [].slice.call(this.parentNode.children);
                var index = list.indexOf(s);
                if (index > 0) {
                    return list[index - 1];
                }
            }
        },
        //指定选择器元素是否在当前事件冒泡路径中
        isEventAgencyTarget: function (selector) {
            var s = this;
            var list = s.querySelectorAll(selector);
            var path = oftenDomFunc.getPath.call(event.target);
            for (var i = 0, len = list.length; i < len; i++) {
                if (path.indexOf(list[i]) > -1) {
                    return list[i];
                }
            }
            return false;
        },
        //加入队列
        queue: function () {
            var s = this;
            var data = s[CUSTOM_DATA_KEY_NAME]['dom-queue'];
            //修正参数
            var name = 'def', func, delay = 0;
            [].forEach.call(arguments, function (item) {
                switch (oftenFunc.isType(item)) {
                    case 'string': name = item; break;
                    case 'function': func = item; break;
                    case 'number': delay = item; break;
                }
            });
            if (func) {
                if (!data[name]) {
                    data[name] = { list: [], timerid: null };
                }
                data[name].list.push({ func: func, delay: delay });
                //是否有延时队列正在执行
                if (data[name].timerid === null) {
                    s.dequeue(name);
                }
            }
            return s;
        },
        //是否有延时队列正在执行
        isqueue: function () {
            var s = this;
            var name = arguments[0] || 'def';
            var data = s[CUSTOM_DATA_KEY_NAME]['dom-queue'];
            return !!data[name].timerid;
        },
        //从队列最前端移除并执行一个队列函数。
        dequeue: function () {
            var s = this;
            var name = arguments[0] || 'def';
            var data = s[CUSTOM_DATA_KEY_NAME]['dom-queue'];
            var first = data[name].list.shift();
            if (first) {
                data[name].timerid = setTimeout(function () {
                    data[name].timerid = null;
                    first.func.call(s);
                    s.dequeue(name);
                }, first.delay);
            }
            return s;
        },
        //清空队列
        clearQueue: function () {
            var s = this;
            var name = arguments[0] || 'def';
            var data = s[CUSTOM_DATA_KEY_NAME]['dom-queue'];
            data[name].list = [];
            clearTimeout(data[name].timerid);
            return s;
        },
        //事件绑定
        on: function on(name, callback) {
            var s = this;
            if (s[CUSTOM_DATA_KEY_NAME]) {
                var data = s[CUSTOM_DATA_KEY_NAME]['dom-event'];
                if (oftenFunc.isType(name) === 'string' &&
                    oftenFunc.isType(callback) === 'function') {
                    name = name.toLowerCase();
                    if (name === 'tap' && !oftenDomFunc.tapEvent.isTouch) {
                        name = 'click';
                    }
                    if (name === 'tap') {
                        if (!data['tap-data']) {
                            oftenDomFunc.tapEvent.init(s);
                        }
                        if (!data['tap-data']['is-bind']) {
                            s.addEventListener('touchstart', data['tap-data']['down-dispose']);
                            s.addEventListener('touchend', data['tap-data']['lift-dispose']);
                        }
                    } else {
                        s.addEventListener(name, callback);
                    }
                    (data[name] = data[name] || []).push(callback);
                }
            }
        },
        //删除事件绑定
        off: function off(name, callback) {
            var s = this;
            if (s[CUSTOM_DATA_KEY_NAME]) {
                var data = s[CUSTOM_DATA_KEY_NAME]['dom-event'];
                if (oftenFunc.isType(name) === 'string') {
                    name = name.toLowerCase();
                    if (callback === undefined) {
                        data[name].forEach(function (item) {
                            s.removeEventListener(name, item);
                        });
                        data[name] = [];
                    } else {
                        if (name === 'tap') {
                            data['tap-data']['is-bind'] = false;
                            s.removeEventListener('touchstart', data['tap-data']['down-dispose']);
                            s.removeEventListener('touchend', data['tap-data']['lift-dispose']);
                        } else {
                            s.removeEventListener(name, callback);
                        }
                        var index = data[name].indexOf(callback);
                        if (index > -1) {
                            data[name].splice(index, 1);
                        }
                    }
                }
            }
        }
    };
    //字符串算式计算
    var equation = {
        unit: {
            vw: 'window.innerWidth',
            vh: 'window.innerHeight',
        },
        calc: function (exp, custom) {
            Object.keys(equation.unit).forEach(function (name) {
                exp = exp.replace(name, equation.unit[name]);
            });
            if (oftenFunc.isType(custom) === 'object') {
                Object.keys(custom).forEach(function (name) {
                    exp = exp.replace(name, custom[name]);
                });
            }
            try {
                return eval(exp);
            } catch (e) {
                return NaN;
            }
        }
    };
    /*
        弹出层
    */
    function Layer(option) {
        var s = this;
        //绑定上下文
        s.show = s.show.bind(s);
        s.close = s.close.bind(s);
        s.update = s.update.bind(s);
        s.destroy = s.destroy.bind(s);
        s.closeto = s.closeto.bind(s);
        s.updateConfig = s.updateConfig.bind(s);
        s.updatePosition = s.updatePosition.bind(s);
        //注册监听器
        eventPush.register(s);
        //计时器列表
        s.timerlist = {};
        //元素缓存
        s.elementCache = {};
        //当前配置
        s.currentConfig = oftenFunc.clone(s.defaultConfig);
        //生成元素
        var wrapper = document.createElement('div');
        wrapper.innerHTML = ' \
            <div class="popup-layer-wrapper" data-show="0">\
                <div class="pl-mask-layer"></div>\
                <div class="pl-mian-wrapper">\
                    <div class="pl-title-bar pl-border-bottom pl-flex">\
                        <div class="pl-title-text"></div>\
                        <div class="pl-close-btn"><div class="pl-icon pl-icon-close"></div></div>\
                    </div>\
                    <div class="pl-content"></div>\
                    <div class="pl-btn-list pl-flex"></div>\
                </div>\
            </div>\
        ';
        s.elementCache['popup-layer-wrapper'] = oftenDomFunc.extend(wrapper.querySelector('.popup-layer-wrapper'));
        s.elementCache['pl-mask-layer'] = oftenDomFunc.extend(wrapper.querySelector('.pl-mask-layer'));
        s.elementCache['pl-mian-wrapper'] = oftenDomFunc.extend(wrapper.querySelector('.pl-mian-wrapper'));
        s.elementCache['pl-title-bar'] = oftenDomFunc.extend(wrapper.querySelector('.pl-title-bar'));
        s.elementCache['pl-title-text'] = oftenDomFunc.extend(wrapper.querySelector('.pl-title-text'));
        s.elementCache['pl-close-btn'] = oftenDomFunc.extend(wrapper.querySelector('.pl-close-btn'));
        s.elementCache['pl-content'] = oftenDomFunc.extend(wrapper.querySelector('.pl-content'));
        s.elementCache['pl-btn-list'] = oftenDomFunc.extend(wrapper.querySelector('.pl-btn-list'));
        s.elementCache['popup-layer-wrapper'].remove();
        //绑定事件
        s.elementCache['pl-mask-layer'].on('tap', function () {
            if (s.currentConfig.tapMaskClose) {
                s.close();
            }
        });
        s.elementCache['pl-close-btn'].on('tap', function () {
            s.close();
        });
        s.elementCache['pl-btn-list'].on('tap', function () {
            var _this = s.elementCache['pl-btn-list'].isEventAgencyTarget('.pl-btn-item');
            if (_this) {
                var index = _this.getAttribute('data-index');
                var callback = s.currentConfig.btnEvent[index];
                if (oftenFunc.isType(callback) === 'function') {
                    callback.call(s);
                }
            }
        });
        s.elementCache['pl-mian-wrapper'].on('transitionend', function () {
            if (s.elementCache['popup-layer-wrapper'].getAttribute('data-show') === '0') {
                s.closeto();
            }
        });
        s.elementCache['pl-mask-layer'].on('transitionend', function () {
            if (s.elementCache['popup-layer-wrapper'].getAttribute('data-show') === '0' &&
                s.currentConfig.content === null) {
                s.closeto();
            }
        });
        window.addEventListener('resize', s.updatePosition);
    };
    //凭证
    Layer.prototype.evidence = { explain: '用于验证非自己的凭证' };
    //显示
    Layer.prototype.show = function () {
        var s = this;
        s.timerlist['show'] = Date.now();
        s.elementCache['popup-layer-wrapper'].attr('data-show', 1);
        return s;
    };
    //关闭
    Layer.prototype.close = function () {
        var s = this;
        s.dispatchEvent('close');
        clearTimeout(clearTimeout(s.timerlist['duration']));
        if (s.currentConfig.tranOut && Date.now() - s.timerlist['show'] > 50) {
            s.elementCache['popup-layer-wrapper'].attr('data-tran', s.currentConfig.tranOut);
        } else {
            s.closeto();
        }
        s.elementCache['popup-layer-wrapper'].attr('data-show', 0);
        return s;
    };
    //关闭完成时处理
    Layer.prototype.closeto = function () {
        var s = this;
        s.dispatchEvent('closeto');
        if (s.elementCache.isCloseAfteDestroy) {
            s.destroy();
        }
        if (s.elementCache['content-parent-node']) {
            if (s.elementCache['content-next-sbiling-node']) {
                s.elementCache['content-parent-node'].insertBefore(s.elementCache['content-node'], s.elementCache['content-next-sbiling-node']);
            } else {
                s.elementCache['content-parent-node'].appendChild(s.elementCache['content-node']);
            }
        }
        s.elementCache['content-node'] = null;
        s.elementCache['content-parent-node'] = null;
        s.elementCache['content-next-sbiling-node'] = null;
        s.elementCache['popup-layer-wrapper'].remove();
        return s;
    };
    //更新
    Layer.prototype.update = function (option) {
        var s = this;
        oftenFunc.deepExtend(s.currentConfig, option, true);
        //推送事件
        s.dispatchEvent('update');
        //更新配置
        s.updateConfig();
        //加入body
        if (!s.elementCache['popup-layer-wrapper'].parentNode) {
            s.currentConfig.parentContainer.appendChild(s.elementCache['popup-layer-wrapper']);
        }
        s.updatePosition();
        return s;
    };
    //销毁
    Layer.prototype.destroy = function () {
        var s = this;
        s.elementCache['pl-mask-layer'].off('tap');
        s.elementCache['pl-close-btn'].off('tap');
        s.elementCache['pl-btn-list'].off('tap');
        s.elementCache['pl-mian-wrapper'].off('transitionend');
        window.removeEventListener('resize', s.updatePosition);
        s.elementCache['popup-layer-wrapper'].remove();
        return s;
    };
    //更新当前配置
    Layer.prototype.updateConfig = function () {
        var s = this;
        var config = s.currentConfig;
        if (config.title === null) {
            s.elementCache['pl-title-bar'].addClass('pl-hide');
        } else {
            s.elementCache['pl-title-text'].innerHTML = config.title;
            s.elementCache['pl-title-bar'].removeClass('pl-hide');
        }
        if (config.isCloseBtn) {
            s.elementCache['pl-close-btn'].removeClass('pl-hide');
        } else {
            s.elementCache['pl-close-btn'].addClass('pl-hide');
        }
        if (config.content !== s.evidence) {
            if (config.content === null) {
                s.elementCache['pl-mian-wrapper'].addClass('pl-hide');
            } else if (config.content !== s.elementCache['content-node']) {
                if (config.content.nodeType === 1) {
                    s.elementCache['content-node'] = config.content;
                    s.elementCache['content-parent-node'] = config.content.parentNode;
                    s.elementCache['content-next-sbiling-node'] = oftenDomFunc.getNextSbiling.call(config.content);
                    s.elementCache['pl-content'].appendChild(config.content);
                } else {
                    s.elementCache['pl-content'].innerHTML = config.content;
                }
                s.elementCache['pl-mian-wrapper'].removeClass('pl-hide');
            }
        }
        if (config.boxback) {
            s.elementCache['pl-mian-wrapper'].css('background', config.boxback);
        } else {
            s.elementCache['pl-mian-wrapper'].css('background', '#fff');
        }
        if (config.button) {
            var html = '';
            config.button.forEach(function (item, i) {
                html += '<div data-index="' + i + '" class="pl-btn-item pl-border-top pl-border-right">' + item + '</div>';
            });
            s.elementCache['pl-btn-list'].removeClass('pl-hide').innerHTML = html;
        } else {
            s.elementCache['pl-btn-list'].addClass('pl-hide');
        }
        if (config.isMask) {
            s.elementCache['pl-mask-layer'].style.backgroundColor = config.maskColor;
            s.elementCache['pl-mask-layer'].removeClass('pl-hide');
        } else {
            s.elementCache['pl-mask-layer'].addClass('pl-hide');
        }
        switch (config.btnAlign) {
            case 'h':
                s.elementCache['pl-btn-list'].addClass('pl-flex');
                break;
            case 'v':
                s.elementCache['pl-btn-list'].removeClass('pl-flex');
                break;
        }
        s.elementCache['pl-content'].attr('data-scroll', config.isScroll ? 1 : 0);
        s.elementCache['pl-mian-wrapper'].css('border-radius', config.borderRadius);
        s.elementCache['popup-layer-wrapper'].attr({
            'data-mode': config.module,
            'data-tran': config.tranIn
        });
        if (config.duration) {
            clearTimeout(s.timerlist['duration']);
            s.timerlist['duration'] = setTimeout(function () {
                s.close();
            }, config.duration);
        }
        return s;
    };
    //更新显示位置
    Layer.prototype.updatePosition = function () {
        var s = this;
        var config = s.currentConfig;
        var arearect = {};
        var calc_reg = 'calc\\((\\S+)\\)';
        var percent_reg = '(([+-]?)\\d+)%$';
        var number_reg = '^(([+-]?)\\d*\\.?\\d+)$';
        var fixedHeight = s.elementCache['pl-title-bar'].clientHeight + s.elementCache['pl-btn-list'].clientHeight;

        s.elementCache['pl-mian-wrapper'].css({ top: '', left: '', width: '', height: '' });
        s.elementCache['pl-content'].css({ top: '', left: '', width: '', height: '' });

        //最小宽度
        if (new RegExp(number_reg).test(config.area.minWidth)) {
            arearect.minWidth = Number(RegExp.$1);
        } else if (new RegExp(calc_reg, 'ig').test(config.area.minWidth)) {
            arearect.minWidth = equation.calc(RegExp.$1) || s.elementCache['pl-content'].clientWidth;
        } else if (new RegExp(percent_reg).test(config.area.minWidth)) {
            arearect.minWidth = window.innerWidth * (Number(RegExp.$1) / 100);
        } else {
            arearect.minWidth = -Infinity;
        }
        //最小高度
        if (new RegExp(number_reg).test(config.area.minHeight)) {
            arearect.minHeight = Number(RegExp.$1);
        } else if (new RegExp(calc_reg, 'ig').test(config.area.minHeight)) {
            arearect.minHeight = equation.calc(RegExp.$1) - fixedHeight || s.elementCache['pl-content'].clientHeight;
        } else if (new RegExp(percent_reg).test(config.area.minHeight)) {
            arearect.minHeight = window.innerWidth * (Number(RegExp.$1) / 100) - fixedHeight;
        } else {
            arearect.minHeight = -Infinity;
        }
        //最大宽度
        if (new RegExp(number_reg).test(config.area.maxWidth)) {
            arearect.maxWidth = Number(RegExp.$1);
        } else if (new RegExp(calc_reg, 'ig').test(config.area.maxWidth)) {
            arearect.maxWidth = equation.calc(RegExp.$1) || window.innerWidth;
        } else if (new RegExp(percent_reg).test(config.area.maxWidth)) {
            arearect.maxWidth = window.innerWidth * (Number(RegExp.$1) / 100);
        } else {
            arearect.maxWidth = window.innerWidth;
        }
        //最大高度
        if (new RegExp(number_reg).test(config.area.maxHeight)) {
            arearect.maxHeight = Number(RegExp.$1);
        } else if (new RegExp(calc_reg, 'ig').test(config.area.maxHeight)) {
            arearect.maxHeight = equation.calc(RegExp.$1) - fixedHeight || window.innerHeight;
        } else if (new RegExp(percent_reg).test(config.area.maxHeight)) {
            arearect.maxHeight = window.innerHeight * (Number(RegExp.$1) / 100) - fixedHeight;
        } else {
            arearect.maxHeight = window.innerHeight;
        }
        if (arearect.minWidth > arearect.maxWidth) {
            arearect.minWidth = arearect.maxWidth;
        }
        if (arearect.minHeight > arearect.maxHeight) {
            arearect.minHeight = arearect.maxHeight;
        }
        //宽度
        switch (config.area.width) {
            case 'full':
                arearect.width = window.innerWidth;
                break;
            default:
                if (new RegExp(number_reg).test(config.area.width)) {
                    arearect.width = Number(RegExp.$1);
                } else if (new RegExp(calc_reg, 'ig').test(config.area.width)) {
                    arearect.width = equation.calc(RegExp.$1);
                } else if (new RegExp(percent_reg).test(config.area.width)) {
                    arearect.width = window.innerWidth * (Number(RegExp.$1) / 100);
                }
                break;
        }
        if (!arearect.width) {
            arearect.width = s.elementCache['pl-content'].clientWidth;
            arearect.isAutoWidth = true;
        }
        if (arearect.isAutoWidth) {
            if (arearect.width < arearect.minWidth || arearect.width > arearect.maxWidth) {
                arearect.width = Math.max(Math.min(arearect.width, arearect.maxWidth), arearect.minWidth);
                s.elementCache['pl-mian-wrapper'].css('width', arearect.width + 'px');
            }
        } else {
            arearect.width = Math.max(Math.min(arearect.width, arearect.maxWidth), arearect.minWidth);
            s.elementCache['pl-mian-wrapper'].css('width', arearect.width + 'px');
        }
        //高度
        switch (config.area.height) {
            case 'full':
                arearect.height = window.innerHeight;
                break;
            default:
                if (new RegExp(number_reg).test(config.area.height)) {
                    arearect.height = Number(RegExp.$1);
                } else if (new RegExp(calc_reg, 'ig').test(config.area.height)) {
                    arearect.height = equation.calc(RegExp.$1) - fixedHeight;
                } else if (new RegExp(percent_reg).test(config.area.height)) {
                    arearect.height = window.innerHeight * (Number(RegExp.$1) / 100) - fixedHeight;
                }
                break;
        }
        if (!arearect.height) {
            arearect.height = s.elementCache['pl-content'].clientHeight;
            arearect.isAutoHeight = true;
        }
        if (arearect.isAutoHeight) {
            if (arearect.height < arearect.minHeight || arearect.height > arearect.maxHeight) {
                arearect.height = Math.max(Math.min(arearect.height, arearect.maxHeight), arearect.minHeight);
                s.elementCache['pl-content'].css('height', arearect.height + 'px');
            }
        } else {
            arearect.height = Math.max(Math.min(arearect.height, arearect.maxHeight), arearect.minHeight);
            s.elementCache['pl-content'].css('height', arearect.height + 'px');
        }
        //水平定位
        switch (config.area.h) {
            case 'left':
                arearect.left = 0;
                break;
            case 'right':
                arearect.left = window.innerWidth - arearect.width;
                break;
            default:
                if (new RegExp(number_reg).test(config.area.h)) {
                    arearect.left = Number(RegExp.$1);
                } else if (new RegExp(calc_reg, 'ig').test(config.area.h)) {
                    arearect.left = equation.calc(RegExp.$1, {
                        'bw': arearect.width,
                        'left': 0,
                        'right': window.innerWidth - arearect.width
                    }) || window.innerWidth / 2 - arearect.width / 2;
                } else if (new RegExp(percent_reg).test(config.area.h)) {
                    arearect.left = window.innerWidth * (Number(RegExp.$1) / 100);
                } else {
                    arearect.left = window.innerWidth / 2 - arearect.width / 2;
                }
                break;
        }
        //垂直定位
        switch (config.area.v) {
            case 'top':
                arearect.top = 0;
                break;
            case 'bottom':
                arearect.top = window.innerHeight - arearect.height - fixedHeight;
                break;
            default:
                if (new RegExp(number_reg).test(config.area.v)) {
                    arearect.top = Number(RegExp.$1);
                } else if (new RegExp(calc_reg, 'ig').test(config.area.v)) {
                    arearect.top = equation.calc(RegExp.$1, {
                        'bh': arearect.height + fixedHeight,
                        'top': 0,
                        'bottom': window.innerHeight - arearect.height
                    }) || window.innerHeight / 2 - (arearect.height + fixedHeight) / 2;
                } else if (new RegExp(percent_reg).test(config.area.v)) {
                    arearect.top = window.innerHeight * (Number(RegExp.$1) / 100);
                } else {
                    arearect.top = window.innerHeight / 2 - (arearect.height + fixedHeight) / 2;
                }
                break;
        }
        s.elementCache['pl-mian-wrapper'].css({
            top: arearect.top + 'px',
            left: arearect.left + 'px'
        });
        return s;
    };
    //默认配置
    Layer.prototype.defaultConfig = (function () {
        return {
            //模块
            module: '',
            //标题
            title: null,
            //内容
            content: null,
            //背景
            boxback: '#fff',
            //圆角
            borderRadius: '8px',
            //显示的时间(number:毫秒|false:一直显示)
            duration: 0,
            //按钮列表 Array(string|number,...)
            button: null,
            //按钮事件列表 Array(function,...)
            btnEvent: null,
            //按钮排列方式 String('h'：横排 | 'v'：竖排)
            btnAlign: 'h',
            /*
                指定显示的区域 Object
                    v(垂直坐标位置)：number |
                        'n%':       相对于屏幕高度的百分比
                        'top':      显示在屏幕最顶端
                        'bottom':   显示在屏幕最底端
                        'centre':   居中显示(默认)
                        'calc()'    计算
                    h(水平坐标位置)：number |
                        'n%':       相对于屏幕宽度的百分比
                        'left':     显示在屏幕最左端
                        'right':    显示在屏幕最右端
                        'centre':   居中显示(默认)
                        'calc()'    计算
                    width(宽度)：number |
                        'n%':       相对于屏幕宽度的百分比
                        'full':     铺满屏幕
                        'calc()'    计算
                    height(高度)：number |
                        'n%':       相对于屏幕高度的百分比
                        'full':     铺满屏幕
                        'calc()'    计算
                    minWidth(最小宽度)：number |
                        'n%':       相对于屏幕宽度的百分比
                        'calc()'    计算
                    minHeight(最小高度)：number |
                        'n%':       相对于屏幕高度的百分比
                        'calc()'    计算
                    maxWidth(最大宽度)：number |
                        'n%':       相对于屏幕宽度的百分比
                        'calc()'    计算
                    maxHeight(最大高度)：number |
                        'n%':       相对于屏幕高度的百分比
                        'calc()'    计算
                    计算单位：
                        vw:         屏幕宽度
                        vh:         屏幕高度
                        bw:         消息框宽度(仅h v可用)
                        bh:         消息框高度(仅h v可用)
                        left：      屏幕最左端(仅h可用)
                        right：     屏幕最右端(仅h可用)
                        top：       屏幕最顶端(仅v可用)
                        bottom：    屏幕最底端(仅v可用)
            */
            area: {},
            //内容是否可以滚动
            isScroll: false,
            //是否显示关闭按钮
            isCloseBtn: true,
            //是否显示遮罩层
            isMask: true,
            //遮罩层颜色
            maskColor: 'rgba(0,0,0,.6)',
            //点击遮罩层是否关闭消息框
            tapMaskClose: true,
            //父容器
            parentContainer: document.body,
            //显示时的过渡动画
            tranIn: 'popup',
            //关闭时的过渡动画
            tranOut: 'popup',
            //是否关闭其他弹框
            isCloseOther: false,
            //关闭后是否自动销毁对象
            isCloseAfteDestroy: true
        };
    })();
    /*
        消息框
    */
    function Msg(option) {
        var s = this;
        option.content = s.evidence;
        //继承
        Layer.call(s, option);
        //生成元素
        s.elementCache['pl-content'].innerHTML = '<div class="pl-msg"></div>';
        s.elementCache['pl-msg'] = oftenDomFunc.extend(s.elementCache['pl-content'].querySelector('.pl-msg'));
        //更新事件
        s.on('update', function () {
            s.elementCache['pl-msg'].innerHTML = s.currentConfig.text;
        });
        //更新配置
        s.update(option);
        //显示
        s.show();
    };
    oftenFunc.extend(Msg.prototype, Layer.prototype);
    Msg.prototype.defaultConfig = oftenFunc.clone(Layer.prototype.defaultConfig);
    oftenFunc.deepExtend(Msg.prototype.defaultConfig, {
        text: '',
        area: {
            'maxWidth': '60%',
            'maxHeight': '60%'
        },
        module: 'content',
        boxback: 'rgba(0,0,0,.7)',
        borderRadius: '4px',
        duration: 2000,
        isMask: false
    }, true);
    /*
        遮罩层
    */
    function Mask(option) {
        var s = this;
        //继承
        Layer.call(s, option);
        //更新配置
        s.update(option);
        //显示
        s.show();
    };
    oftenFunc.extend(Mask.prototype, Layer.prototype);
    Mask.prototype.defaultConfig = oftenFunc.clone(Layer.prototype.defaultConfig);
    /*
        tips
    */
    function Tips(option) {
        var s = this;
        option.content = s.evidence;
        //继承
        Layer.call(s, option);
        //生成元素
        s.elementCache['pl-content'].innerHTML = '<div class="pl-tips"></div>';
        s.elementCache['pl-tips'] = oftenDomFunc.extend(s.elementCache['pl-content'].querySelector('.pl-tips'));
        //更新配置
        s.update(option);
        //显示
        s.show();
    };
    oftenFunc.extend(Tips.prototype, Layer.prototype);
    Tips.prototype.defaultConfig = oftenFunc.clone(Layer.prototype.defaultConfig);
    //默认配置
    oftenFunc.deepExtend(Tips.prototype.defaultConfig, {
        text: '',
        //显示方向(如果指定方向无法显示完整，则按照top right bottom left顺序依次计算，如果没有一个方向能显示完整，则使用指定方向显示)
        direction: 'top',
        //吸附元素
        adsorbElement: null,
        area: {
            'maxWidth': 220
        },
        module: 'tips',
        boxback: 'rgba(0,0,0,.7)',
        borderRadius: '3px',
        duration: 2000,
        isMask: false
    }, true);
    //更新当前配置
    Tips.prototype.updateConfig = function () {
        var s = this;
        var config = s.currentConfig;

        s.elementCache['pl-title-bar'].addClass('pl-hide');
        s.elementCache['pl-btn-list'].addClass('pl-hide');

        if (config.adsorbElement.nodeType === 1) {
            config.parentContainer = config.adsorbElement.parentNode;
        }
        if (config.text === null) {
            s.elementCache['pl-mian-wrapper'].addClass('pl-hide');
        } else if (config.text !== s.elementCache['content-node']) {
            if (config.text.nodeType === 1) {
                s.elementCache['content-node'] = config.text;
                s.elementCache['content-parent-node'] = config.text.parentNode;
                s.elementCache['content-next-sbiling-node'] = oftenDomFunc.getNextSbiling.call(config.text);
                s.elementCache['pl-tips'].appendChild(config.text);
            } else {
                s.elementCache['pl-tips'].innerHTML = config.text;
            }
            s.elementCache['pl-mian-wrapper'].removeClass('pl-hide');
        }
        if (config.boxback) {
            s.elementCache['pl-mian-wrapper'].css({
                'background': config.boxback
            });
            s.elementCache['pl-tips'].css({
                'border-color': config.boxback
            });
        } else {
            s.elementCache['pl-mian-wrapper'].css({
                'background': '#fff'
            });
            s.elementCache['pl-tips'].css({
                'border-color': '#fff'
            });
        }
        if (config.isMask) {
            s.elementCache['pl-mask-layer'].style.backgroundColor = config.maskColor;
            s.elementCache['pl-mask-layer'].removeClass('pl-hide');
        } else {
            s.elementCache['pl-mask-layer'].addClass('pl-hide');
        }
        s.elementCache['pl-mian-wrapper'].css('border-radius', config.borderRadius);
        s.elementCache['popup-layer-wrapper'].attr({
            'data-mode': config.module,
            'data-tran': config.tranIn
        });
        if (config.duration) {
            clearTimeout(s.timerlist['duration']);
            s.timerlist['duration'] = setTimeout(function () {
                s.close();
            }, config.duration);
        }
        return s;
    };
    //更新显示位置
    Tips.prototype.updatePosition = function () {
        var s = this;
        var config = s.currentConfig;
        var arearect = {};
        var calc_reg = 'calc\\((\\S+)\\)';
        var percent_reg = '(([+-]?)\\d+)%$';
        var number_reg = '^(([+-]?)\\d*\\.?\\d+)$';
        var fixedHeight = s.elementCache['pl-title-bar'].clientHeight + s.elementCache['pl-btn-list'].clientHeight;


        s.elementCache['pl-mian-wrapper'].css({ top: '', left: '', width: '', height: '' });
        s.elementCache['pl-content'].css({ top: '', left: '', width: '', height: '' });

        //最小宽度
        if (new RegExp(number_reg).test(config.area.minWidth)) {
            arearect.minWidth = Number(RegExp.$1);
        } else if (new RegExp(calc_reg, 'ig').test(config.area.minWidth)) {
            arearect.minWidth = equation.calc(RegExp.$1) || s.elementCache['pl-content'].clientWidth;
        } else if (new RegExp(percent_reg).test(config.area.minWidth)) {
            arearect.minWidth = window.innerWidth * (Number(RegExp.$1) / 100);
        } else {
            arearect.minWidth = -Infinity;
        }
        //最小高度
        if (new RegExp(number_reg).test(config.area.minHeight)) {
            arearect.minHeight = Number(RegExp.$1);
        } else if (new RegExp(calc_reg, 'ig').test(config.area.minHeight)) {
            arearect.minHeight = equation.calc(RegExp.$1) - fixedHeight || s.elementCache['pl-content'].clientHeight;
        } else if (new RegExp(percent_reg).test(config.area.minHeight)) {
            arearect.minHeight = window.innerWidth * (Number(RegExp.$1) / 100) - fixedHeight;
        } else {
            arearect.minHeight = -Infinity;
        }
        //最大宽度
        if (new RegExp(number_reg).test(config.area.maxWidth)) {
            arearect.maxWidth = Number(RegExp.$1);
        } else if (new RegExp(calc_reg, 'ig').test(config.area.maxWidth)) {
            arearect.maxWidth = equation.calc(RegExp.$1) || window.innerWidth;
        } else if (new RegExp(percent_reg).test(config.area.maxWidth)) {
            arearect.maxWidth = window.innerWidth * (Number(RegExp.$1) / 100);
        } else {
            arearect.maxWidth = window.innerWidth;
        }
        //最大高度
        if (new RegExp(number_reg).test(config.area.maxHeight)) {
            arearect.maxHeight = Number(RegExp.$1);
        } else if (new RegExp(calc_reg, 'ig').test(config.area.maxHeight)) {
            arearect.maxHeight = equation.calc(RegExp.$1) - fixedHeight || window.innerHeight;
        } else if (new RegExp(percent_reg).test(config.area.maxHeight)) {
            arearect.maxHeight = window.innerHeight * (Number(RegExp.$1) / 100) - fixedHeight;
        } else {
            arearect.maxHeight = window.innerHeight;
        }
        if (arearect.minWidth > arearect.maxWidth) {
            arearect.minWidth = arearect.maxWidth;
        }
        if (arearect.minHeight > arearect.maxHeight) {
            arearect.minHeight = arearect.maxHeight;
        }
        //宽度
        switch (config.area.width) {
            case 'full':
                arearect.width = window.innerWidth;
                break;
            default:
                if (new RegExp(number_reg).test(config.area.width)) {
                    arearect.width = Number(RegExp.$1);
                } else if (new RegExp(calc_reg, 'ig').test(config.area.width)) {
                    arearect.width = equation.calc(RegExp.$1);
                } else if (new RegExp(percent_reg).test(config.area.width)) {
                    arearect.width = window.innerWidth * (Number(RegExp.$1) / 100);
                }
                break;
        }
        if (!arearect.width) {
            arearect.width = s.elementCache['pl-content'].clientWidth;
            arearect.isAutoWidth = true;
        }
        if (arearect.isAutoWidth) {
            if (arearect.width < arearect.minWidth || arearect.width > arearect.maxWidth) {
                arearect.width = Math.max(Math.min(arearect.width, arearect.maxWidth), arearect.minWidth);
                s.elementCache['pl-mian-wrapper'].css('width', arearect.width + 'px');
            }
        } else {
            arearect.width = Math.max(Math.min(arearect.width, arearect.maxWidth), arearect.minWidth);
            s.elementCache['pl-mian-wrapper'].css('width', arearect.width + 'px');
        }
        //高度
        switch (config.area.height) {
            case 'full':
                arearect.height = window.innerHeight;
                break;
            default:
                if (new RegExp(number_reg).test(config.area.height)) {
                    arearect.height = Number(RegExp.$1);
                } else if (new RegExp(calc_reg, 'ig').test(config.area.height)) {
                    arearect.height = equation.calc(RegExp.$1) - fixedHeight;
                } else if (new RegExp(percent_reg).test(config.area.height)) {
                    arearect.height = window.innerHeight * (Number(RegExp.$1) / 100) - fixedHeight;
                }
                break;
        }
        if (!arearect.height) {
            arearect.height = s.elementCache['pl-content'].clientHeight;
            arearect.isAutoHeight = true;
        }
        if (arearect.isAutoHeight) {
            if (arearect.height < arearect.minHeight || arearect.height > arearect.maxHeight) {
                arearect.height = Math.max(Math.min(arearect.height, arearect.maxHeight), arearect.minHeight);
                s.elementCache['pl-content'].css('height', arearect.height + 'px');
            }
        } else {
            arearect.height = Math.max(Math.min(arearect.height, arearect.maxHeight), arearect.minHeight);
            s.elementCache['pl-content'].css('height', arearect.height + 'px');
        }
        //定位
        var corner = 10;
        var direction;
        var offsetTop = s.currentConfig.adsorbElement.offsetTop;
        var offsetLeft = s.currentConfig.adsorbElement.offsetLeft;
        var adsorbElementRect = s.currentConfig.adsorbElement.getBoundingClientRect();
        var checklist = ['top-0', 'top-1', 'top-2', 'right-0', 'right-1', 'right-2', 'bottom-0', 'bottom-1', 'bottom-2', 'left-0', 'left-1', 'left-2'];
        var checkfull = function (direc) {
            switch (direc) {
                case 'top-0':
                    arearect.top = offsetTop - arearect.height - corner;
                    arearect.left = offsetLeft;
                    break;
                case 'top-1':
                    arearect.top = offsetTop - arearect.height - corner;
                    arearect.left = offsetLeft - (arearect.width - adsorbElementRect.width) / 2;
                    break;
                case 'top-2':
                    arearect.top = offsetTop - arearect.height - corner;
                    arearect.left = offsetLeft + adsorbElementRect.width;
                    break;
                case 'right-0':
                    arearect.top = offsetTop;
                    arearect.left = offsetLeft + adsorbElementRect.width + corner;
                    break;
                case 'right-1':
                    arearect.top = offsetTop - (arearect.height - adsorbElementRect.height) / 2;
                    arearect.left = offsetLeft + adsorbElementRect.width + corner;
                    break;
                case 'right-2':
                    arearect.top = offsetTop + adsorbElementRect.height;
                    arearect.left = offsetLeft + adsorbElementRect.width + corner;
                    break;
                case 'bottom-0':
                    arearect.top = offsetTop + adsorbElementRect.height + corner;
                    arearect.left = offsetLeft;
                    break;
                case 'bottom-1':
                    arearect.top = offsetTop + adsorbElementRect.height + corner;
                    arearect.left = offsetLeft - (arearect.width - adsorbElementRect.width) / 2;
                    break;
                case 'bottom-2':
                    arearect.top = offsetTop + adsorbElementRect.height + corner;
                    arearect.left = offsetLeft + adsorbElementRect.width;
                    break;
                case 'left-0':
                    arearect.top = offsetTop;
                    arearect.left = offsetLeft - arearect.width - corner;
                    break;
                case 'left-1':
                    arearect.top = offsetTop - (arearect.height - adsorbElementRect.height) / 2;
                    arearect.left = offsetLeft - arearect.width - corner;
                    break;
                case 'left-2':
                    arearect.top = offsetTop + adsorbElementRect.height;
                    arearect.left = offsetLeft - arearect.width - corner;
                    break;
            }
            s.elementCache['pl-mian-wrapper'].css({
                top: arearect.top + 'px',
                left: arearect.left + 'px'
            });
            var rectbox = s.elementCache['pl-mian-wrapper'].getBoundingClientRect();
            if (rectbox.top >= 0 && rectbox.right >= 0 && rectbox.bottom >= 0 && rectbox.left >= 0) {
                return true;
            }
            return false;
        };

        checklist.splice(0, 0, checklist.splice(checklist.indexOf(config.direction + '-0'), 1)[0]);
        checklist.splice(1, 0, checklist.splice(checklist.indexOf(config.direction + '-1'), 1)[0]);
        checklist.splice(2, 0, checklist.splice(checklist.indexOf(config.direction + '-2'), 1)[0]);

        checklist.every(function (name) {
            if (checkfull(name)) {
                return direction = name, false;
            }
            return true;
        });
        if (!direction) {
            direction = config.direction + '-1';
        }
        s.elementCache['pl-tips'].attr({
            'data-direc': direction
        });
        return s;
    };
    /*
        弹出框
    */
    function Open(option) {
        var s = this;
        //继承
        Layer.call(s, option);
        //更新配置
        s.update(option);
        //显示
        s.show();
    };
    oftenFunc.extend(Open.prototype, Layer.prototype);
    Open.prototype.defaultConfig = oftenFunc.clone(Layer.prototype.defaultConfig);
    //默认配置
    oftenFunc.deepExtend(Open.prototype.defaultConfig, {
        area: {
            'maxWidth': '80%',
            'maxHeight': '80%'
        },
        module: 'content',
        isScroll: true,
        tapMaskClose: false
    }, true);
    /*
        提示框
    */
    function Alert(option) {
        var s = this;
        option.content = s.evidence;
        //继承
        Layer.call(s, option);
        //生成元素
        s.elementCache['pl-content'].innerHTML = '<div class="pl-alert"></div>';
        s.elementCache['pl-alert'] = oftenDomFunc.extend(s.elementCache['pl-content'].querySelector('.pl-alert'));
        //更新事件
        s.on('update', function () {
            s.elementCache['pl-alert'].innerHTML = s.currentConfig.text;
        });
        //更新配置
        s.update(option);
        //显示
        s.show();
    };
    oftenFunc.extend(Alert.prototype, Layer.prototype);
    Alert.prototype.defaultConfig = oftenFunc.clone(Layer.prototype.defaultConfig);
    //默认配置
    oftenFunc.deepExtend(Alert.prototype.defaultConfig, {
        text: '',
        area: {
            'v': '30%',
            'minWidth': '200',
            'maxWidth': '60%',
            'maxHeight': '60%'
        },
        module: 'content',
        button: ['确定'],
        btnEvent: [function () {
            this.close();
        }],
        isCloseOther: false,
        isCloseAfteDestroy: true
    }, true);
    /*
        输入框
    */
    function Prompt(option) {
        var s = this;
        option.content = s.evidence;
        //继承
        Layer.call(s, option);
        //生成元素
        s.elementCache['pl-content'].innerHTML = ' \
            <div class="pl-prompt">\
                <div class="pl-text"></div>\
                <div class="pl-input"><input value=""></div>\
            </div>\
        ';
        s.elementCache['pl-text'] = oftenDomFunc.extend(s.elementCache['pl-content'].querySelector('.pl-text'));
        s.elementCache['pl-input'] = oftenDomFunc.extend(s.elementCache['pl-content'].querySelector('.pl-input input'));
        //更新事件
        s.on('update', function () {
            s.elementCache['pl-text'].innerHTML = s.currentConfig.text;
            s.elementCache['pl-input'].attr({
                'type': s.currentConfig.inputType,
                'placeholder': s.currentConfig.placeholder
            });
        });
        //更新配置
        s.update(option);
        //显示
        s.show();
    };
    oftenFunc.extend(Prompt.prototype, Layer.prototype);
    Prompt.prototype.defaultConfig = oftenFunc.clone(Layer.prototype.defaultConfig);
    //默认配置
    oftenFunc.deepExtend(Prompt.prototype.defaultConfig, {
        text: '',
        placeholder: '',
        area: {
            'v': '30%',
            'minWidth': '200',
            'maxWidth': '80%',
            'maxHeight': '80%'
        },
        module: 'content',
        //回调函数
        callback: null,
        //自定义验证函数
        verify: null,
        //输入类型
        inputType: 'text',
        isCloseBtn: true,
        tapMaskClose: false,
        button: ['取消', '确定'],
        btnEvent: [function () {
            this.close();
        }, function () {
            this.confirm();
        }]
    }, true);
    //确认输入回调处理
    Prompt.prototype.confirm = function () {
        var s = this;
        if (oftenFunc.isType(s.currentConfig.callback) === 'function') {
            var val = s.elementCache['pl-input'].value;
            if (oftenFunc.isType(s.currentConfig.verify) === 'function') {
                var result = s.currentConfig.verify(val);
                if (result === true) {
                    s.currentConfig.callback.call(s, val);
                } else {
                    layxs.tips(result, s.elementCache['pl-input']);
                }
            } else {
                s.currentConfig.callback.call(s, val);
            }
        }
    };
    /*
        询问框
    */
    function Confirm(option) {
        var s = this;
        option.content = s.evidence;
        //继承
        Layer.call(s, option);
        //生成元素
        s.elementCache['pl-content'].innerHTML = '<div class="pl-confirm"></div>';
        s.elementCache['pl-confirm'] = oftenDomFunc.extend(s.elementCache['pl-content'].querySelector('.pl-confirm'));
        //更新事件
        s.on('update', function () {
            s.elementCache['pl-confirm'].innerHTML = s.currentConfig.text;
        });
        //更新配置
        s.update(option);
        //显示
        s.show();
    };
    oftenFunc.extend(Confirm.prototype, Layer.prototype);
    Confirm.prototype.defaultConfig = oftenFunc.clone(Layer.prototype.defaultConfig);
    //默认配置
    oftenFunc.deepExtend(Confirm.prototype.defaultConfig, {
        text: '',
        area: {
            'v': '30%',
            'minWidth': '200',
            'maxWidth': '60%',
            'maxHeight': '60%'
        },
        module: 'content',
        button: ['否', '是'],
        btnEvent: [function () {
            this.close();
        }, function () {
            this.close();
        }],
        btnAlign: 'h',
        isCloseBtn: true,
        tapMaskClose: false
    }, true);
    /*
        加载提示
    */
    function Loading(option) {
        var s = this;
        option.content = s.evidence;
        //继承
        Layer.call(s, option);
        //生成元素
        s.elementCache['pl-content'].innerHTML = ' \
            <div class="pl-loading">\
                <div class="pl-icon pl-icon-loading"></div>\
                <div class="pl-text">加载中...</div>\
            </div>\
        ';
        s.elementCache['pl-text'] = oftenDomFunc.extend(s.elementCache['pl-content'].querySelector('.pl-text'));
        //更新事件
        s.on('update', function () {
            s.elementCache['pl-text'].innerHTML = s.currentConfig.text;
        });
        //更新配置
        s.update(option);
        //显示
        s.show();
    };
    oftenFunc.extend(Loading.prototype, Layer.prototype);
    Loading.prototype.defaultConfig = oftenFunc.clone(Layer.prototype.defaultConfig);
    //默认配置
    oftenFunc.deepExtend(Loading.prototype.defaultConfig, {
        text: '',
        area: {
            'minWidth': '90',
            'maxWidth': '60%'
        },
        module: 'loading',
        boxback: 'rgba(0,0,0,.6)',
        maskColor: 'rgba(0,0,0,.2)',
        borderRadius: '3px',
        tapMaskClose: false
    }, true);

    //入口
    var layxs = {
        //历史
        history: [],
        //模块列表
        module: {},
        //自增id
        incrementID: 0,
        //初始化
        init: function () {
            var s = this;
            s.module['msg'] = Msg;
            s.module['mask'] = Mask;
            s.module['tips'] = Tips;
            s.module['open'] = Open;
            s.module['alert'] = Alert;
            s.module['prompt'] = Prompt;
            s.module['confirm'] = Confirm;
            s.module['loading'] = Loading;
            //加入样式文件
            var link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.href = document.currentScript.src.replace(/\/[^/]+$/, '/layxs.css');
            document.head.appendChild(link);
            return s;
        },
        //关闭所有或指定id的弹框
        close: function (id) {
            var s = this;
            if (id === undefined) {
                s.history.forEach(function (item) {
                    item.close();
                });
                s.history = [];
            } else {
                var index = oftenFunc.indexOf(s.history, id, 'id');
                if (index > -1) {
                    s.history.splice(index, 1).close();
                }
            }
        },
        //默认配置设置
        config: function (name, option) {
            var s = this;
            var obj = s.module[name];
            if (obj) {
                Object.keys(option).forEach(function (name) {
                    if (name in obj.prototype.defaultConfig) {
                        obj.prototype.defaultConfig[name] = option[name];
                    }
                });
            }
            return s;
        },
        //获取自增id
        getAutoIncrementID: function () {
            layxs.incrementID += 1;
            return layxs.incrementID;
        },
    };
    //消息框
    layxs.msg = function () {
        var s = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.isType(option)) {
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
            box.id = s.getAutoIncrementID();
            if (box.currentConfig.isCloseOther) {
                s.close();
            }
            s.history.push(box);
            return box;
        }
    };
    //遮罩层
    layxs.mask = function () {
        var s = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.isType(option)) {
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
        box.id = s.getAutoIncrementID();
        if (box.currentConfig.isCloseOther) {
            s.close();
        }
        s.history.push(box);
        return box;
    };
    //tips
    layxs.tips = function () {
        var s = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.isType(option)) {
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
            box.id = s.getAutoIncrementID();
            if (box.currentConfig.isCloseOther) {
                s.close();
            }
            s.history.push(box);
            return box;
        }
    };
    //页面弹出框
    layxs.open = function () {
        var s = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.isType(option)) {
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
            box.id = s.getAutoIncrementID();
            if (box.currentConfig.isCloseOther) {
                s.close();
            }
            s.history.push(box);
            return box;
        }
    };
    //提示框
    layxs.alert = function () {
        var s = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.isType(option)) {
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
            box.id = s.getAutoIncrementID();
            if (box.currentConfig.isCloseOther) {
                s.close();
            }
            s.history.push(box);
            return box;
        }
    };
    //输入框
    layxs.prompt = function () {
        var s = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.isType(option)) {
            case 'object':
                config = option;
                break;
            default:
                config = {
                    text: option
                };
                if (oftenFunc.isType(arguments[1]) === 'function') {
                    config.callback = arguments[1];
                }
                break;
        }
        if (config.text !== null) {
            var box = new Prompt(config);
            box.id = s.getAutoIncrementID();
            if (box.currentConfig.isCloseOther) {
                s.close();
            }
            s.history.push(box);
            return box;
        }
    };
    //询问框
    layxs.confirm = function () {
        var s = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.isType(option)) {
            case 'object':
                config = option;
                break;
            default:
                config = {
                    text: option
                };
                if (arguments.length > 1) {
                    config.btnEvent = [];
                }
                if (oftenFunc.isType(arguments[1]) === 'function') {
                    config.btnEvent[0] = arguments[1];
                }
                if (oftenFunc.isType(arguments[2]) === 'function') {
                    config.btnEvent[1] = arguments[2];
                }
                break;
        }
        if (config.text !== null) {
            var box = new Confirm(config);
            box.id = s.getAutoIncrementID();
            if (box.currentConfig.isCloseOther) {
                s.close();
            }
            s.history.push(box);
            return box;
        }
    };
    //加载提示
    layxs.loading = function () {
        var s = this;
        var config;
        var option = arguments[0];
        switch (oftenFunc.isType(option)) {
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
            var box = new Loading(config);
            box.id = s.getAutoIncrementID();
            if (box.currentConfig.isCloseOther) {
                s.close();
            }
            s.history.push(box);
            return box;
        }
    };
    //暴露入口
    window.layxs = layxs.init();
})(window);