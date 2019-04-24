var QBH5BaseUrl = "//res.imtt.qq.com/html5game/api/";
var QBH5Config = {
    appid: "9665978216",
    appsig: "",
    appsigData: "",
    isTest: 0,
    devDomain: "//cp.open.html5.qq.com",

    middleurl: QBH5BaseUrl + "actionProxy.html",
    proxyurl: QBH5BaseUrl + "proxy.html",
    authurl: QBH5BaseUrl + "auth.html",
    shareurl: QBH5BaseUrl + "shareMiddle.html",
    cssurl: QBH5BaseUrl + "css/qbh5sdk.css",
    sdksrv: "https://open.html5.qq.com/",
    mdsAppIDs: ["1450004218", "1450005499"],//0:非wx环境mdsappid,1:wx环境mdsappid
    mdsUrls: ["//midas.gtimg.cn/h5pay/js/api/midas.js", "//midas.gtimg.cn/h5sdk/js/api/h5sdk.js"],//0:非wx环境下url，1:wx环境下url
    version: "20160728",
    lglv: 1, //logLevel
    sandbox: 0
};
;var QBH5 = (function () {
    //'use strict';
    var chnName = "ch";
    var config = QBH5Config; //config变量在config.js中定义

    var escape = encodeURIComponent, unescape = decodeURIComponent, setting = {
        loginCallBack: null
    },
        $qid = function (selector) {
            return document.getElementById(selector);
        },
        $qclass = function (selector) {
            return document.getElementsByClassName(selector);
        };

    var qbNativeCall = function () {
        if (!window.qb_bridge)
            return function (success, fail, service, action, args) {
            };

        var bridge = window.qb_bridge;
        bridge.callbackId = Math.floor(Math.random() * 2000000000);
        bridge.callbacks = {};

        bridge.exec = function (success, fail, service, action, args) {
            var callbackId = service + bridge.callbackId++,
                argsJson = args ? JSON.stringify(args) : "";

            if (success || fail) {
                bridge.callbacks[callbackId] = { success: success, fail: fail };
            }

            return bridge.nativeExec(service, action, callbackId, argsJson);
        };

        bridge.callbackFromNative = function (callbackId, args) {
            var callback = bridge.callbacks[callbackId];
            var argsJson = JSON.parse(args);

            if (callback) {
                if (argsJson.succ) {
                    callback.success && callback.success(argsJson.msg);
                } else {
                    callback.fail && callback.fail(argsJson.msg);
                }

                if (!argsJson.keep) {
                    delete bridge.callbacks[callbackId];
                }
            }
        };
        return bridge.exec;
    };

    var platInfo = {
        ua: navigator.userAgent,
        isAndroid: false,
        isIos: false,
        isQb: false,
        isQQ: false,
        isQZ: false,
        isWX: false,
        isAP: false,
        isQbInstall: false,
        isMobile: false,
        check: function () {
            var p = this, ua = p.ua;
            //系统
            p.isAndroid = /android/ig.test(ua);
            p.isIos = /iphone|ipod|iPad/ig.test(ua);
            //平台
            p.isQZ = /qzone/gi.test(ua);
            p.isWX = /micromessenger/gi.test(ua);
            if (p.isQZ) {
                p.isQQ = p.isQb = false;
            } else {
                p.isQb = /mqq/ig.test(ua);
                p.isQQ = /mobile.*qq/gi.test(ua) && !/mobile.*mqqbrowser/gi.test(ua); //小包版的会被判断为QQ
            }
            p.isQb = p.isQb && !(p.isQQ || p.isWX); //在qq和微信中不为qb
            this.getQua();
            p.pageStage = p.isWX ? "wx" : p.isQQ ? "qq" : p.isQb ? "qb" : "other";
            p.isMobile = /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(ua);
        },
        getQua: function () {
            try {
                qbNativeCall(function (qua) {
                    if (!qua) return;
                    var p = platInfo;
                    p.isIos = /ios/ig.test(qua);
                    p.isAndroid = /Android/ig.test(qua);
                    p.isQb = true;
                    p.isAP = /APQB/ig.test(qua);
                    p.isX5 = /ADRQBX/ig.test(qua);
                    p.isQbSys = p.isAndroid && !p.isX5 && !p.isAP;
                    p.isQb && (p.pageStage = "qb");
                }, null, "qb", "qua", null);
            } catch (e) {
                util.debug(4, "GetQua error:" + e.message);
                report.tryCatchErr(e);
            }
        }
    };
    platInfo.check();
    var util = {
        getCookie: function (cookieName) {
            var arr, reg = new RegExp("(^| )" + cookieName + "=([^;]*)(;|$)"), ck;
            if (arr = document.cookie.match(reg)) {
                ck = arr[2] || "";
                ck = ck.replace(/%u/ig, '\\u'); //防止中文被编码成unicode 解码时出错
                return unescape(ck);
            }
            return "";
        },
        setCookie: function (opts) {
            if (opts.cookieName && opts.cookieValue) {
                var expires = new Date();
                expires.setTime(expires.getTime() + opts.seconds);
                document.cookie = escape(opts.cookieName) + '=' + escape(opts.cookieValue) + (expires ? '; expires=' + expires.toGMTString() : '') + ('; path=/') + (opts.domain ? '; domain=' + opts.domain : '') + (opts.secure ? '; secure' : '');
            }
        },
        clearCookie: function () {
            var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
            if (keys) {
                for (var i = keys.length; i--;) {
                    document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
                }
            }
        },
        postMessage: function (iframe, targetOrigin, msg) {
            targetOrigin = "*";
            if (typeof iframe === 'string')
                iframe = $qid(iframe);
            iframe.contentWindow.postMessage(msg, targetOrigin);
        },
        onGetMessage: function (window, targetOrigin, callback) {
            function messageEvent() {
                //同时支持http与https
                if (event.origin.indexOf('http://ui.ptlogin2.qq.com') > -1 || event.origin.substring(event.origin.indexOf("://") + 1) == util.getHost(QBH5BaseUrl)) {
                    callback && callback(event.data, event.source);
                }
            }

            window.addEventListener("message", messageEvent);
            return messageEvent;
        },
        getHost: function (url) {
            var host = url.substring(0, url.indexOf("/", "http://".length));
            return host;
        },
        removeGetMessage: function (eventFunction) {
            window.removeEventListener("message", eventFunction);
        },
        formatParams: function (data, salt) {
            if (typeof data === "string")
                return data;
            var arr = [];
            for (var name in data) arr.push(escape(name) + "=" + escape(data[name]));
            if (salt) arr.push("v=" + Math.random());
            return arr.join("&");
        },
        getKey: function (key, srcString) {
            var result,
                sourceParams = (typeof srcString === 'string') ? srcString : window.location.search,
                regExp = new RegExp("(\\?|&)+" + key + "=([^&\\?]*)");

            result = sourceParams.match(regExp);
            return (!result ? "" : unescape(result[2]));
        },
        delKey: function (url, key) {
            var uriqs = url.split('?'),
                qshash = uriqs.length > 1 ? uriqs[1].split('#') : [],
                args = qshash.length ? qshash[0].split('&') : [],
                i = 0,
                l = args.length,
                arg,
                arr = [];
            for (; i < l; i++) {
                arg = args[i].split('=');
                if (arg[0] !== key) {
                    arr.push(args[i]);
                }
            }
            return uriqs[0] + (arr.length ? '?' + arr.join('&') : '') + (qshash.length > 1 ? '#' + qshash[1] : '');
        },
        toParams: function (object, encodeFlag) {
            var arr = [], type, value;
            if (typeof object === 'string') {
                return object;
            }
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    value = object[key];
                    type = typeof value;
                    if (type === 'object' || type === 'array') {
                        value = JSON.stringify(value);
                    }
                    if (!encodeFlag)
                        arr.push(key + "=" + escape(value));
                    else
                        arr.push(key + "=" + value);
                }
            }
            return arr.join("&");
        },
        addParams: function (url, data, encodeFlag) {
            var index = url.indexOf('?');
            if (index === -1) {
                url += "?";
            } else {
                url += "&";
            }

            if (typeof data === "object")
                url += util.toParams(data, encodeFlag);
            else
                url += data;

            return url;
        },
        openUrl: function (url, self) {
            //为兼容ios8，ios8不兼容window.location
            if (self) {
                window.open(url, '_self');
            } else {
                var a = document.createElement("a");
                a.href = url;
                a.click();
            }

            /*
             var click = document.createEvent("Event");
             click.initEvent("click", false, true);
             a.dispatchEvent(click);
             */
        },

        formatTime: function (date, fmt) {
            if (!isNaN(date)) {
                date = new Date(parseInt(date) * 1000);
            }
            fmt = fmt || "yyyy-MM-dd hh:mm:ss.S";
            var o = {
                "M+": date.getMonth() + 1,
                "d+": date.getDate(),
                "h+": date.getHours(),
                "m+": date.getMinutes(),
                "s+": date.getSeconds(),
                "q+": Math.floor((date.getMonth() + 3) / 3),
                "S": date.getMilliseconds()
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        },
        loadJs: function (url, callback) {
            var script = document.createElement("script");
            script.id = script.id || "qb_loadjs_" + new Date().getTime();
            script.type = "text/javascript";
            script.charset = "utf-8";
            if (script.readyState) {
                script.onreadystatechange = function () {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        callback && callback();
                    }
                };
            } else {
                script.onload = function () {
                    callback && callback();
                };
            }
            script.src = url;
            document.body.appendChild(script);
            // var pageScript = document.getElementsByTagName("script")[0];
            // pageScript.parentNode.insertBefore(script, pageScript);
        },
        ajax: function (options, callback, errorback) {
            options = options || {};
            var type = (options.type || "GET").toUpperCase();
            var dataType = options.dataType || "json";

            var xhr = null;
            if (window.XMLHttpRequest) xhr = new XMLHttpRequest(); else xhr = new ActiveXObject('Microsoft.XMLHTTP');
            var callbackId = report.reqStart();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    var status = xhr.status;
                    var result = xhr.responseText;
                    if ((status >= 200 && status < 300) || xhr.status == 304) {
                        report.reqEnd(callbackId);
                        if (dataType == 'script') (1, eval)(result);
                        else if (dataType == 'xml') result = xhr.responseXML;
                        else if (dataType == 'json') result = /^\s*$/.test(result) ? null : JSON.parse(result);
                        callback && callback(result);
                    } else {
                        report.reqErr();
                        errorback && errorback(xhr.statusText || null, xhr.status ? 'error' : 'abort');
                    }
                }
            };
            var targetUrl = "", data = null;
            var params = util.formatParams(options.data);
            if (type == "GET") {
                targetUrl = options.url + "?" + params;
            } else if (type == "POST") {
                targetUrl = options.url;
                data = params;
            }

            xhr.open(type, targetUrl, true);
            //options.crossDomain && xhr.setRequestHeader("Origin", window.location.host);
            (type == "POST") && xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(data);
        },
        /** 输出日志
         *
         * @param loglev 日志级别：0-info，1-trace，2-debug，3-warn，4-error
         * @param data 需记录的数据，字符串或对象
         * @param name 日志的描述名称
         * @param handler 扩展的日志输出方法
         * @returns {boolean} 已输出返回true,未输出false
         */
        debug: function (loglev, data, name, handler) {
            var lgtp = config["lgtp"] || 0;
            var lglv = config["lglv"] || 0;

            if (loglev < lglv)
                return false;

            if (typeof data === "object")
                data = JSON.stringify(data);

            if (name) data = name + ":" + data;

            switch (lgtp) {
                case 0:
                    return false;
                    break;
                case 1:
                    console.info(data);
                    break;
                case 2:
                    alert(data);
                    break;
                case 3:
                    var logid = "__LogPannel__";
                    var logDom = $qid(logid);
                    if (!logDom) {
                        var div = document.createElement("div");
                        div.id = logid;
                        div.style.position = "fixed";
                        div.style.left = "5px";
                        div.style.top = "10px";
                        div.style.width = "300px";
                        div.style.height = "200px";
                        div.contenteditable = true;
                        document.body.appendChild(div);
                    }
                    if (logDom) {
                        var text = logDom.innerText;
                        if (text.length > 300) {
                            text = text.substr(text.length - 150);
                        }
                        text += data + "<hr>";
                        logDom.innerHTML = text;
                    }
                    break;
                case 4:
                    handler && handler(data);
                    break;
                default:
                    return false;
                    break;
            }
            return true;
        },
        debugResult: function (loglev, result, name) {
            if (result) {
                util.debug(loglev, result.result + "," + result.msg, name);
            }
        }
    };

    window.addEventListener("load", function () {
        warnSandbox();
        //return;
        //统计上报初始化
        //3gimg.qq.com/bookshelf/js/mig-report.min.3d7aeb1f.js
        util.loadJs('//res.imtt.qq.com/bookshelf/js/mig-report.min.js', function () {
            try {
                MIG_REPORT.setConfig({
                    appId: 'h5game.jssdk',      //{String} appId: 用于区分各接入业务的唯一标识，必填项，格式为(xxx.yyy)，如小说业务中的书城则是: bookshelf.bookstore
                    delay: 5,                   //{Number} delay: 上报数据的请求间隔（单位秒），非必填项，默认为5，即每5秒检查一次是否有需要上报的数据
                    errDetail: false,            //{Boolean} errDetail: 是否上报具体的异常信息，非必填项，默认为false
                    perPercentage: 10,          //{Number} perPercentage: 性能数据的上报百分比，非必填项，默认为10，即有10%的性能数据会被上报
                    globalCapture: true,        //{Boolean} globalCapture: 是否对window.onerror进行监听并上报错误，非必填项，默认为true
                    ignore: [],                 //{Array} ignore: 正则表达式组成的数组(元素为RegExp对象或正则字面量)，匹配的具体异常信息将被忽略，非必填项，默认为空数组
                    autoReportLoadTime: true    //{Boolean} autoReportLoadTime: 是否自动检测并上报首屏渲染数据，非必填项，默认为true；此时仅上报window.onload或DOMLoaded的耗时，如需进一步功能请设定为false并调用renderEnd
                });

                //上报js pv
                var logPv = setTimeout(function () {
                    clearTimeout(logPv);
                    var loginRsp = util.getKey('loginRsp'), code = 1; //游戏主页
                    if (loginRsp !== "") {
                        code = 2; //登录响应回跳
                    }
                    report.log(10, 0, 0, code, location.href);
                }, 60);
            } catch (e) {
                util.debug(4, 'MIG_REPORT.setConfig error:' + e.message);
            }
        });
    });

    var storage = localStorage;

    var report = {
        flag: 0,
        hasLoaded: function () {
            return report.flag || (report.flag = (typeof (MIG_REPORT) != "undefined") && MIG_REPORT.monitor);
        },
        log: function (event_type, event_result, error_code, expand, extra_error_code, phase, cost, share_item, lazyReportFlag) {
            try {
                var item = (setting["channel"] ? setting["channel"] : '')
                    + '|' + event_type
                    + '|' + event_result
                    + '|' + (error_code ? error_code : '')
                    + '|' + (expand ? expand : '')
                    + '|' + (extra_error_code ? extra_error_code : '')
                    + '|' + (phase ? phase : 0)
                    + '|' + (cost ? cost : '')
                    + '|' + (share_item ? share_item : '')
                    + '|' + (storage.getItem("appid") ? storage.getItem("appid") : '')
                    + '|' + (config.loginType ? config.loginType : '')
                    + '|' + (platInfo.pageStage ? platInfo.pageStage : ''
                        + '|' + (config.sandbox ? config.sandbox : config.isTest));

                //先存储，下次进入时延迟上报，防止日志即将上报时，页面将发生跳转引起日志上报丢失的问题
                if (lazyReportFlag) {
                    storage.setItem("@rpt_" + event_type + "_" + (new Date().getTime()) + "_" + parseInt(Math.random() * 1000), item);
                } else {
                    report.logLazyReport();
                    (report.hasLoaded()) && MIG_REPORT.monitor.log(item);
                }
            } catch (e) {
                util.debug(4, 'report.log err:' + e.message);
            }
        },
        logHold: function (event_type, event_result, error_code, expand, extra_error_code, phase, cost, share_item) {
            report.log(event_type, event_result, error_code, expand, extra_error_code, phase, cost, share_item, 1);
        },
        logLazyReport: function () {
            var key, value, prefix = "@rpt_", cnt = 0;
            for (var i = storage.length - 1; i >= 0; i--) {
                key = storage.key(i);
                if (key.indexOf(prefix) > -1) {
                    value = storage.getItem(key);
                    if (report.hasLoaded()) {
                        MIG_REPORT.monitor.log(value);
                        storage.removeItem(key);
                        cnt++;
                    }
                }
            }
            if (cnt > 0) {
                util.debug(2, "Reported held logs:" + cnt);
            }
        },
        reqStart: function () {
            var reqId;
            try {
                reqId = (report.hasLoaded()) && MIG_REPORT.monitor.reqStart();
            } catch (e) {
                util.debug(4, 'report.reqStart err:' + e.message);
            }
            return reqId;
        },
        reqEnd: function (reqId) {
            try {
                (report.hasLoaded()) && MIG_REPORT.monitor.reqEnd(reqId);
            } catch (e) {
                util.debug(4, 'report.reqEnd err:' + e.message);
            }
        },
        reqErr: function () {
            try {
                (report.hasLoaded()) && MIG_REPORT.monitor.reqErr();
            } catch (e) {
                util.debug(4, 'report.reqErr err:' + e.message);
            }
        },
        reqFail: function () {
            try {
                (report.hasLoaded()) && MIG_REPORT.monitor.reqFail();
            } catch (e) {
                util.debug(4, 'report.reqFail err:' + e.message);
            }
        },
        tryCatchErr: function (ex) {
            try {
                (report.hasLoaded()) && MIG_REPORT.monitor.reportErr(ex);
            } catch (e) {
                util.debug(4, 'report.tryCatchErr err:' + e.message);
            }
        }
    };

    function addNode(tag, className, id, text) {
        var node = document.createElement(tag);
        id && (node.id = id);
        className && (node.className = className);
        text && (node.innerHTML = text);
        return node;
    }

    function addCSSToHead() {
        var heads = document.getElementsByTagName("head");
        if (heads.length > 0) {
            var head = heads[0];
            if(!head.getElementsByTagName) {
                return ;
            }
            var styles = head.getElementsByTagName("link");
            for (var i = 0; i < styles.length; i++) {
                if (styles[i].href.indexOf(config.cssurl) > -1)
                    return;
            }

            var style = addNode("link");
            style.type = "text/css";
            style.rel = "stylesheet";
            style.href = config.cssurl + "?v=" + config.version;
            head.appendChild(style);
        }
    }

    /** 用iframe方式显示子窗口内容，并实现父子窗口通讯回调
     *
     * @param option 窗体显示选项
     *  {string} id 必选，窗口的唯一标识id
     *  {string} title 可选，窗口的标题
     *  {string} leftText 可选，左上角按钮文本
     *  {string} leftAction 可选，左上角按钮对应的链接
     *  {string} rightText 可选，右上角按钮文本
     *  {string} rightAction 可选，右上角按钮对应的链接
     *  {string} url 必选，子窗口iframe的地址
     *  {string} holder 可选，显示子窗口的html标签容器，默认为body
     *  {string} iframeCallback 可选，子窗口高父窗口通信的回调方法
     *  {string} visible 可选，窗口是否可见
     */
    function showWindow(option) {
        var id = option.id || "",
            title = option.title || "",
            leftText = option.leftText || "",
            leftAction = option.leftAction || "",
            rightText = option.rightText || "",
            rightAction = option.rightAction || "",
            url = option.url || "",
            holder = option.holder || document.body,
            iframeCallback = option.iframeCallback,
            visible = (option.visible != undefined && option.visible) || false,
            showHeader = option.showHeader || false;

        //var height = window.screen.height - (showHeader ? 42 : 0);
        //height = height < 460 ? height : 460; //米大师支付时超出页面时(小屏/横屏)能滑动
        //height = height +"px";
        var height = "100%";

        url = util.addParams(url, { v: config.version, sandbox: config.sandbox });

        var html = '<div class="mod-mask"></div><section class="mod-dialog-iframe"><div class="inner">\
            ' + (showHeader ? '<div class="dialog-header"><h2>' + title + '</h2><div class="btn-back">' + leftText + '</div><div class="btn-edit">' + rightText + '</div></div>' : '') + '\
            <div class="dialog-content" style="height:100%"><div class="dialog-content-inner" style="height:100%"><iframe id="iframe' + id + '" src="' + url + '"  scrolling="auto" style="border:0;width:100%;height: ' + height + ';"></iframe></div></div>\
            </div></section>';

        var oldBox = id && $qid(id);
        var winBox = oldBox || addNode("div", "winBox", id);
        !visible && (winBox.style.display = "none");
        winBox.innerHTML = html;
        if (!oldBox) { //之前未创建过窗口（未绑定过事件）
            var originUrl = util.getHost(url);
            var msgEvent = util.onGetMessage(window, originUrl, function (ret, senderWindow) {
                try {
                    ret = JSON.parse(ret);
                    if (ret && (ret.action == 0 || ret.action == 1 || ret.action == 'close')) { //result:0为左链接，1为右链接
                        if (winBox && winBox.parentNode) {
                            winBox.parentNode.removeChild(winBox);
                        }
                        util.removeGetMessage(msgEvent);
                    }
                } catch (e) {
                    util.debug(4, "RemoveIframeErr:" + e.message);
                    report.tryCatchErr(e);
                }
                if (ret && typeof ret === 'object') {
                    ret.data = ret.data || {};
                    ret.data.act = ret.action;
                    iframeCallback && iframeCallback(ret.data);
                } else {
                    iframeCallback && iframeCallback(ret);
                }

            });
        }
        holder.appendChild(winBox);
        var iframe = $qid("iframe" + id);

        bindWindow(option);

        return { container: winBox, iframe: iframe };
    }

    function bindWindow(option) {
        if (option.showHeader && (option.leftText || option.rightText)) {
            if (option.leftText && option.leftAction) {
                var leftBtn = $qclass("btn-back")[0];
                leftBtn.onclick = function () {
                    winAction(option.leftAction);
                };
            }

            if (option.rightText && option.rightAction) {
                var leftBtn = $qclass("btn-edit")[0];
                leftBtn.onclick = function () {
                    winAction(option.rightAction);
                };
            }

            //btn-edit
            function winAction(action) {
                if (typeof action == "function") {
                    action();
                } else {
                    window.location.href = action;
                }
            }
        }
    }

    function showLoading(title) {
        /*
         var loader = $qclass("qbh5load");
         var flag = loader.length;
         flag && (loader = loader[0]);
         !flag && (loader = addNode("div", "qbh5load"));
         loader.innerHTML = '<div class="mod-mask"></div><section class="mod-sdk-loading"><div class="loading-pane"><div class="icon-sdk-loading"></div><div class="text-loading">' + title + '</div></div></section>';
         !flag && document.body.appendChild(loader);
         */
        toast(title, 60000, true, true, true, function () {
            //toast("请求超时！");
        });
    }

    function showShare(plat, opts, callback) {
        if (!plat.wx && !plat.wp && !plat.qq && !plat.qz) {
            callback('error, no plat');
        }
        var htmlStr = '';
        var shareSeg = [];

        if (plat.qz) {
            htmlStr += '<a class="btn-share"><i class="icon-qzone"></i><span>QQ空间</span></a>';
        }
        if (plat.wp) {
            htmlStr += '<a class="btn-share"><i class="icon-timeline"></i><span>微信朋友圈</span></a>';
        }
        if (plat.wx) {
            htmlStr += '<a class="btn-share"><i class="icon-wechat"></i><span>微信好友</span></a>';
        }
        if (plat.qq) {
            htmlStr += '<a class="btn-share"><i class="icon-qq"></i><span>QQ好友</span></a>';
        }

        var loader = $qclass("h5gameshare");
        var flag = loader.length;
        flag && (loader = loader[0]);
        !flag && (loader = addNode("div", "h5gameshare"));

        loader.innerHTML = '<section class="mod-dialog-share"><div class="share-pane">' + htmlStr + '</div></section>';
        !flag && document.body.appendChild(loader);

        if (!flag) {
            plat.qz && ($qclass('icon-qzone')[0].onclick = function shareCallBack() {
                opts.toApp = 3;
                shareApp(opts, callback);
            });
            plat.wp && ($qclass('icon-timeline')[0].onclick = function shareCallBack() {
                opts.toApp = 8;
                shareApp(opts, callback);
            });
            plat.wx && ($qclass('icon-wechat')[0].onclick = function shareCallBack() {
                opts.toApp = 1;
                shareApp(opts, callback);
            });
            plat.qq && ($qclass('icon-qq')[0].onclick = function shareCallBack() {
                opts.toApp = 4;
                shareApp(opts, callback);
            });
        }
    }

    function hideShare() {
        var loader = $qclass("h5gameshare")[0];
        loader && loader.parentNode && loader.parentNode.removeChild(loader);
    }

    function shareApp(option, callback) {
        /*
         url: window.location.href,
         title: window.document.title,
         description: "好玩的游戏",
         imgUrl: "http://mb.qq.com/images/logo.jpg",
         imgTitle: "测试Demo",
         cusTxt: "测试游戏Demo是一款专注于测试demo api的游戏",
         toApp: toApp // 1:微信 ; 8 :朋友圈; 3: qq空间 ; 4:qq好友 ; 0: 显示面板
         */
        var data = {}, url = "", closeUrl = config.middleurl + "?act=close", title = "分享到";

        switch (option.toApp) {
            case 4:
                /*
                 site:网站appid
                 summary:简介
                 title:标题
                 appid:应用id
                 imageUrl:分享图片
                 targetUrl:分享链接
                 page_url:点击返回跳转的链接
                 nobar:是否去掉顶部栏（传1则去掉）
                 pagetitle:页面标题
                 appCallback:分享完成后请求的url，会把分享相关信息带上
                 */
                data = {
                    appName: "QQ浏览器",
                    action: "shareToQQ",
                    title: option.title,
                    summary: option.description,
                    imageUrl: option.imgUrl,
                    targetUrl: option.url,
                    page_url: closeUrl,
                    pagetitle: option.title,
                    appCallback: location.href
                };

                url = util.addParams('http://openmobile.qq.com/api/check?page=shareindex.html&style=9&sdkp=a&sdkv=1.7&status_machine=&status_os=4.0.4&req_type=1&nobar=0&site=&appid=728024702', data);
                url = config.middleurl + "?act=jump&targetUrl=" + escape(url);
                title += "QQ好友";
                break;
            case 3:
                /*title - 标题
                 summary - 描述
                 url - 分享地址
                 desc - 默认分享语(可选)
                 imageUrl - 图片地址(可选)
                 site - 来源(可选)
                 successUrl - 成功后跳转的链接(可选)
                 failUrl - 用户取消后跳转的链接(可选)
                 callbackUrl - 分享结果后台回调(可选)
                 sid - 公司内业务可使用sid登录态(可选)*/
                data = {
                    title: option.title,
                    summary: option.description,
                    imageUrl: option.imgUrl,
                    url: option.url,
                    successUrl: closeUrl,
                    failUrl: closeUrl,
                    callbackUrl: closeUrl
                };
                url = util.addParams('http://openmobile.qq.com/api/check2?page=qzshare.html&loginpage=loginindex.html&logintype=qzone', data);
                title += "QQ空间";
                break;
            /*
             case 'wx' :
             case 'wp' :
             util.openUrl(util.addParams(config.shareurl, option));
             break;
             */
            default:
                url = config.shareurl;
                title += "微信好友/朋友圈/QQ好友";
                break;
        }

        //util.openUrl(url);return;

        var winBox = showWindow({
            id: "frmShare",
            title: title,
            showHeader: false,
            rightText: "完成",
            rightAction: function () {
                closeDialog(winBox.container);
                hideShare();
                report.log(1, 0, 0, option.toApp);
                callback && callback({ result: 0, msg: "" });
            },
            url: url,
            visible: true,
            iframeCallback: function () {
                hideShare();
                report.log(1, 0, 0, option.toApp);
                callback && callback({ result: 0, msg: "" });
            }
        });
    }

    function hideLoading() {
        //var loader = $qclass("qbh5load")[0];
        var loader = $qclass("mod-toast")[0];
        loader && loader.parentNode && loader.parentNode.removeChild(loader);
        loader = undefined;
    }

    /** 显示支付信息(余额、代金券选择及支付确认)弹出框
     *
     * @param option 窗体显示选项
     *  {string} id 必选，支付信息弹出框ID
     *  {string} title 可选，支付信息弹出框标题
     *  {string} payCentAmount 必选，
     *  {string} payAmount 必选，
     *  {string} coin 必选，
     *  {string} rmbPayAmount 必选，需充值的人民币
     *  {string} orderno 可选，订单号
     *  {string} exchange 可选，汇率
     *  {array} coupons 可选，代金券
     *  {function} callback 可选，支付/取消回调方法
     */
    function showDialog(option) {
        //生成代金券列表
        var couponsHtml = "", couponType = "", couponTypes = ["专用", "多用", "通用"], couponStyle = "", couponStyles = ["card-green", "card-purple", "card-blue"];
        var couponTotal = 0, coupons = "";
        if (option.coupons && option.coupons.length > 0) {
            var i, items = ['<div class="coupon-card ', ' " data-id="', '" data-amount="', '"><div class="coupon-cat"><span>', '</span></div><div class="coupon-value"><span class="num">', '</span>Q米</div><div class="coupon-msg"><p>', '<br>有效期至', '</p></div></div>'];
            if (Array.isArray(option.coupons)) {
                option.coupons.forEach(function (item) {
                    i = 0;
                    //couponTotal += item.lCoin;
                    for (var k = 0; k < couponTypes.length; k++) {
                        if (item.sCouponName.indexOf(couponTypes[k]) >= 0) {
                            couponType = couponTypes[k];
                            couponStyle = couponStyles[k];
                            break;
                        }
                    }

                    coupons += items[i] + couponStyle + items[++i] + item.sCouponNo + items[++i] + item.lCoin + items[++i] + (couponType + "券") + items[++i] + item.lCoin + items[++i] + item.sDesc + items[++i] + util.formatTime(item.lInvalidTime, "yyyy-MM-dd") + items[++i];
                });
            }
        }
        if (!coupons) {
            coupons = "暂无代金券";
        }

        //couponsHtml = "";//@@@屏蔽代金券功能

        var html = '<div class="mod-mask"></div><section class="mod-dialog-pay"> \
        <div class="inner" id="PayDialog"  style="display:inline-block;">\
            <div class="dialog-btn-close"><i class="icon-close"></i></div>\
            <div class="dialog-header"><h2>购买' + option.title + '</h2></div>\
                <div class="dialog-content">\
                <div class="payitem"><span class="pay-title">道具金额</span><span class="pay-value">' + option.payAmount + ' Q米 ( ' + option.payCentAmount + '元 )</span></div>\
                <div class="payitem"><span class="pay-title">账户余额</span><span class="pay-value">' + option.coin + ' Q米</span></div>\
                <div class="payitem"><span class="pay-title">代金券</span><span class="subtitle">(' + option.coupons.length + '张可用)</span><span class="pay-value" id="dialog-btn-detail"><b id="couponResult">' + couponTotal + '</b> Q米<i class="icon-arrow-right"></i></span></div>\
                <div class="paydetail"><h3><i class="icon-coin"></i>应充值</h3><div class="sum"><span class="num">' + option.rmbPayAmount + '</span><span class="unit">元</span></div></div>\
                </div>\
            <div class="dialog-footer"><a class="dialog-btn-sure">充值并购买</a></div>\
        </div>\
        <div class="inner" id="PayDialogCoupons" style="display:none">\
            <div class="dialog-header"><h2>选择代金券</h2></div>\
            <div class="dialog-btn-back"><i class="icon-back"></i></div>\
            <div class="dialog-content">\
                <div class="couponlist">' + coupons + '</div>\
                <div class="couponlist-info">代金券不设找零，此处只显示该游戏可用代金券，如需查看所有代金券请至游戏个人中心。</div>\
            </div>\
        </div></section>';

        var id = option.id;
        var dialogNode = id && $qid("dialog_" + id);
        var dialog = dialogNode || addNode("div", "sdk_dialog", "dialog_" + id);
        dialog.innerHTML = html;
        document.body.appendChild(dialog);


        var items = $qclass("coupon-card"), item = null;
        var checkedClass = "card-on", uncheckedClass = "coupon-card";
        for (var i = 0; i < items.length; i++) {
            item = items[i];

            item.addEventListener("click", function () {
                var cpNo = "", cpAmt = 0;
                var clsName = this.attributes["class"].value;
                updateCSS(checkedClass, "");
                if (clsName.indexOf(checkedClass) == -1) { //当前未选中
                    this.attributes["class"].value += " " + checkedClass;
                    cpNo = this.getAttribute("data-id");
                    cpAmt = this.getAttribute("data-amount");
                } else {
                    this.parentNode.attributes["class"].value = this.parentNode.attributes["class"].value.replace(" " + checkedClass, "");
                }

                var totalNode = $qid("dialog-btn-detail");
                totalNode.setAttribute("data-total", cpAmt);
                totalNode.setAttribute("data-ids", cpNo);
                var couponResult = $qid("couponResult");
                couponResult.innerHTML = "-" + cpAmt;

                var delay = setTimeout(function () {
                    clearTimeout(delay);
                    switchDialog(0);//加到支付确认界面
                }, 400);
            });
        }

        function updateCSS(selector, targetClassName) {
            var parent = $qclass("couponlist")[0];
            if (parent) {
                var nodes = parent.getElementsByClassName(selector), n, oldClass = "";
                for (var j = 0; j < nodes.length; j++) {
                    n = nodes[j];
                    oldClass = n.attributes["class"].value;
                    if (targetClassName == "") {
                        oldClass = oldClass.replace(" card-on", targetClassName);
                    } else {
                        if (oldClass.indexOf("card-on") == -1) {
                            oldClass += " card-on";
                        }
                    }
                    n.attributes["class"].value = oldClass;
                }
            }
        }

        bindDialog(dialog, option);

        return dialog;
    }

    function bindDialog(dialog, option) {
        function payAction(type) {
            var totalNode = $qid("dialog-btn-detail");
            var ids = totalNode && totalNode.dataset.ids;
            var resp = { action: type, coupons: ids, holder: dialog };
            option.callback && option.callback(resp);
        }

        var closeBtn = $qclass("icon-close")[0];
        closeBtn.onclick = function () {
            payAction(2);
            closeDialog(dialog);
        };

        var payBtn = $qclass("dialog-btn-sure")[0];
        payBtn.onclick = function () {
            payAction(1);
        };

        if (option.coupons && option.coupons.length > 0) {
            var detailBtn = $qid("dialog-btn-detail");
            detailBtn.onclick = function () {
                switchDialog(1);
            };
            var backBtn = $qclass("dialog-btn-back")[0];
            backBtn.onclick = function () {
                switchDialog(0);
            };
        }
    }

    function switchDialog(showDetail) {
        var panel = $qid("PayDialog"), panelDetail = $qid("PayDialogCoupons");
        if (showDetail) {
            panel.attributes["style"].value = "display:none;";
            panelDetail.attributes["style"].value = "display:inline-block;";
        } else {
            panel.attributes["style"].value = "display:inline-block;";
            panelDetail.attributes["style"].value = "display:none;";
        }
    }

    function closeDialog(dialog) {
        dialog && dialog.parentNode && dialog.parentNode.removeChild(dialog);
        dialog = undefined;
    }

    /** Toast提示信息
     *
     * @param msg 文本信息
     * @param duration Toast显示持续时间
     * @param hasSpinIcon 是否显示滚动图标
     * @param middle 是否垂直居中
     * @param noease 提示信息显示与隐藏是否无缓动效果（渐入渐出）
     * @param timeOutCallback 超时后的回调方法
     */
    function toast(msg, duration, hasSpinIcon, middle, noease, timeOutCallback) {
        duration = duration || 2000;
        hasSpinIcon && (msg = '<span class="loader"></span><span class="loadText">' + msg + '</span>');
        var content = addNode("div", "mod-toast-content", null, msg);
        var box = addNode("div", "mod-toast", "toast" + parseInt(Math.random() * 100000));
        box.style.display = "block";
        box.style.opacity = 0;
        middle && (box.style.bottom = "50%");
        box.appendChild(content);

        var easeTime = (noease && 10) || 200;

        var delay = setTimeout(function () {
            box.style.opacity = 1; //设置不透明度
            clearTimeout(delay);

            delay = setTimeout(function () {
                clearTimeout(delay);
                box.style.opacity = 0; //设置不透明度

                delay = setTimeout(function () {
                    clearTimeout(delay);
                    closeDialog(box); //移除toast
                    timeOutCallback && timeOutCallback();
                }, easeTime);
            }, duration);
        }, easeTime);

        document.body.appendChild(box);
    }

    function warnSandbox() {
        if (config.sandbox == 1) {
            toast("你当前正处于沙箱模式（数据与正式隔离）！")
        }
    }

    function getLoginTypeCode() {
        return config.loginType == "qq" ? 0 : config.loginType == "wx" ? 1 : 0
    }


    /** 以Post方式提交数据跳转页面
     *
     * @param url 目标地址
     * @param option 请求参数对象
     */
    function formPostIframe(url, option) {
        var form = document.createElement("form");
        form.action = url;
        form.method = "POST";
        form.target = "_self";
        form.enctype = "application/json";
        form.innerHTML = "<input type='hidden' name = 'data' value='" + JSON.stringify(option) + "'>";
        document.body.appendChild(form);
        form.submit();
        form.parentNode.removeChild(form);
    }

    /** 以Ajax或Form(Post) + Iframe方式提交请求
     *
     * @param option
     *  {int} type 请求方式 1:ajax请求 2:form post方式请求iframe
     *  {string} apiName Api名称
     *  {Object} data 请求的数据
     *  {Function} succCallBack 成功回调方法
     *  {Function} errorCallBack 出错回调方法
     */
    function request(option) {
        option.type || (option.type = 1);
        var url = config.sdksrv;
        if (option.data.sPaySig) {
            var paysig = { paysig: option.data.sPaySig };
            delete option.data.sPaySig;
            url = util.addParams(config.sdksrv, paysig, true);
        }

        var sandbox = parseInt(config.sandbox);
        var isFormal = !parseInt(config.isTest);
        var sandboxFix = "";
        if (sandbox == 1 && isFormal)
            sandboxFix = "sandbox";

        var reqData = {
            obj: "qbgamecenterproxy" + sandboxFix,
            func: option.apiName,
            data: option.data
        };

        if (option.type == 1) {
            var ajaxOption = {
                type: "POST",
                url: url,
                crossDomain: true,
                data: JSON.stringify(reqData),
                dataType: "json"
            };
            util.ajax(ajaxOption, option.succCallBack, option.errorCallBack);
        } else {
            var iframeId = "frmMdspay";
            reqData.url = url;
            reqData.target = iframeId;
            var url = config.sdksrv;

            showWindow({ id: iframeId, url: url, iframeCallBack: option.succCallBack });
            formPostIframe(reqData);
        }
    }

    function qbBrowserLogin(opts, callback) {
        var obj = {
            appid: opts.appid,
            appsig: opts.appsig,
            appsigData: opts.appsigData,
            loginType: opts.loginType
        };
        try {
            qbNativeCall(function (rsp) {
                callback && callback(rsp);
            }, null, "x5gameplayer", "login", obj);
        } catch (e) {
            util.debug(4, "qbwxLogin error:" + e.message);
            report.tryCatchErr(e);
            var obj = {
                result: 1,
                msg: "",
                qbopenid: "",
                qbopenkey: "",
                refreshToken: "",
                nickName: "",
                avatarUrl: ""
            };
            callback && callback(obj);
        }
    }

    function ptLogin(option, callback) {
        var url = config.middleurl;
        if (typeof util.getCookie('skey') !== 'undefined' && util.getCookie('skey') != "" && platInfo.isQQ === true) {
            url = config.authurl;
        }
        var targetUrl = util.addParams(url, option) + "&act=login&sAppUrl=" + escape(location.href) + "&sChannel=" + setting["channel"] + "&v=" + config.version;
        if (config.sandbox) {
            targetUrl += "&sandbox=" + config.sandbox;
        }
        targetUrl = util.delKey(targetUrl, "loginRsp"); //再次登录前去掉之前的登录失败为null的旧参数
        if (platInfo.isMobile) {
            util.openUrl(targetUrl);
        } else {
            var winbox = null;
            var iFrameCb = function (data) {
                if (data) {
                    if (data.act == 'resize') {
                        ptlogin2_onResize(getWinbox(), data.width, data.height);
                    }
                    var loginRsp = data.loginRsp;
                    if (loginRsp) {
                        qcore.config({
                            loginRsp: JSON.stringify(loginRsp),
                            loginCallBack: callback
                        });
                    }
                }
            };
            winbox = showWindow({
                id: 'pclogin',
                visible: true,
                iframeCallback: iFrameCb,
                url: targetUrl
            });
            winbox = winbox.iframe;
            function getWinbox() {
                return winbox;
            }
        }
    }

    function ptlogin2_onResize(winbox, width, height) {
        //获得浮动Div对象
        if (winbox) {
            //重新设置大小注意，一定要加px，否则firefox下有问题
            winbox.style.width = width + "px";
            winbox.style.height = height + "px";
            //最好重新调整登录框的位置， 这儿略....
            //先隐藏，在显示，这样可以避免滚动条的出现
            winbox.style.visibility = "hidden"
            winbox.style.visibility = "visible"
        }
    }

    function wxLogin(option, callback) {
        util.debug(2, option, "wxlogin");

        var targetUrl = location.href;// util.addParams(config.authurl, option) + "&act=login&sAppUrl=" + escape(location.href) + "&sChannel=" + setting["channel"] + "&v=" + config.version;
        var data = {
            sAppid: option.appid,
            sAppData: option.appsigData + "&" + option.appsig,
            sURL: targetUrl,
            sChannel: setting["channel"]
        };

        var reqOption = {
            type: 1,
            apiName: "h5JsWxAuth",
            data: data,
            succCallBack: function (rsp) {
                if (rsp && rsp.iResult == 0 && rsp.sMessage == 'OK' && rsp.sWxAuthURL !== '') {
                    util.openUrl(rsp.sWxAuthURL);
                } else {
                    util.debug(3, rsp.sMessage);
                }
            },
            errorCallBack: function (err) {
                /*if (rsp && rsp.iResult == 0 && rsp.sMessage == 'OK' && rsp.sWxAuthURL !== '') {
                 util.openUrl(rsp.sWxAuthURL);
                 } else {
                 alert(rsp.sMessage);
                 }*/
                util.debug(4, "wxlogin error:", err);
            }
        };

        try {
            request(reqOption);
        } catch (e) {
            report.tryCatchErr(e);
            util.debug(4, e.message, "wxloginEx");
        }
    }

    function getMidasAuthObject(mdsOptions, authObj) {

        var isSelfLogin = 0;//qq域下自实现qq登录或微信登录  //location.host.indexOf("qq.com") > -1;
        if (util.getCookie("qqopenid")) {
            isSelfLogin = 1;
            config.loginType = "qq";
        } else if (util.getCookie("wxopenid")) {
            isSelfLogin = 1;
            config.loginType = "wx";
        }

        if (config.loginType == "qq") { //qq
            //qq域下自实现qq登录或微信登录的从当前域名下取
            if (isSelfLogin) {
                mdsOptions["sessionid"] = "openid";// "uin";
                mdsOptions["sessiontype"] = "kp_accesstoken";//"skey";
                mdsOptions["openid"] = util.getCookie("qqopenid") || util.getCookie("sdk_uin") || "";
                mdsOptions["openkey"] = util.getCookie("qqopenkey") || util.getCookie("sdk_token") || "";
            } else {
                //qq登录自动去qq域下取
            }
        } else { //wx
            var id, key = "";
            if (isSelfLogin) {
                id = util.getCookie("wxopenid") || "";
                key = util.getCookie("wxopenkey") || "";
            } else {
                id = (authObj && authObj["openid"]) || "";
                key = (authObj && authObj["openkey"]) || "";

                if (!id || !key) {
                    var wxOpenid = localStorage.getItem("wxOpenid");
                    var wxOpenkey = localStorage.getItem("wxOpenkey");
                    if (wxOpenid && wxOpenkey) {
                        id = wxOpenid;
                        key = wxOpenkey;
                    }
                }
            }

            //util.debug(2, document.cookie, "cookie");

            mdsOptions["sessionid"] = "hy_gameid";
            mdsOptions["sessiontype"] = "wc_actoken";
            mdsOptions["openid"] = id;
            mdsOptions["openkey"] = key;
        }
        return mdsOptions;
    }

    function setAppid(appid) {
        try {
            storage.setItem("appid", appid);
        } catch (e) {
            util.debug("SetAppidErr:" + e.message);
        }
    }

    var qcore = {
        /** SDK配置接口
         *
         * @param option 选项配置对象
         */
        config: function (option) {
            if (!option) {
                return;
            }
            for (var p in option) {
                setting[p] = (option[p] != undefined ? option[p] : setting[p]);
            }

            var loginCallBack = option.loginCallBack;

            //登录跳转回登录/主界面时
            if (loginCallBack && typeof loginCallBack === "function") {
                var wxOpendId = util.getKey('wxOpenid'),
                    wxOpenKey = util.getKey('wxOpenkey'),
                    loginRsp = option.loginRsp || util.getKey('loginRsp');

                util.debug(2, location.href, "wxloginRedirect");
                if (!wxOpendId && !loginRsp)
                    return;

                var url = location.href;
                if (wxOpendId !== "" || wxOpenKey !== "") {
                    try {
                        storage.setItem('wxOpenid', wxOpendId);
                        storage.setItem('wxOpenkey', wxOpenKey);

                        url = util.delKey(url, 'wxOpenid');
                        url = util.delKey(url, 'wxOpenkey');

                    } catch (e) {
                        report.tryCatchErr(e);
                        util.debug(4, e.message, "wxloginCallBack");
                    }
                }

                var rspObj = {
                    result: 1,
                    msg: "",
                    qbopenid: "",
                    qbopenkey: "",
                    refreshToken: "",
                    nickName: "",
                    avatarUrl: "",
                    rspsig: ""
                };
                if (loginRsp !== "") {
                    try {
                        loginRsp = loginRsp.replace(/\+/ig, "");//去掉微信回来时自动带+号
                        try {
                            loginRsp = JSON.parse(loginRsp);
                        } catch (e) {
                            report.tryCatchErr(e);
                            util.debug(4, e.message, "loginRspParse");
                        }
                        if (loginRsp.stResult && loginRsp.stResult.iResult === 0) {
                            rspObj.result = loginRsp.stResult.iResult;
                            rspObj.msg = loginRsp.stResult.sMessage;
                            rspObj.qbopenid = loginRsp.sQBOpenid || "";
                            rspObj.qbopenkey = loginRsp.sQBOpenKey || "";
                            rspObj.refreshToken = loginRsp.sRefreshToken || "";
                            rspObj.nickName = loginRsp.sNickName || "";
                            rspObj.avatarUrl = loginRsp.sAvatarUrl || "";
                            rspObj.rspsig = loginRsp.sRspSig || "";

                            var ls = storage;
                            ls.setItem("qbopenid", rspObj.qbopenid);
                            ls.setItem("nickName", rspObj.nickName);
                            ls.setItem("avatarUrl", rspObj.avatarUrl);
                            report.logHold(2, 0);
                        } else {
                            if (!loginRsp.stResult.iResult) {
                                loginRsp.stResult.iResult = 603;
                                loginRsp.stResult.sMessage = "Empty result";
                                report.logHold(2, 1, 300, "", loginRsp.stResult.iResult + ':' + loginRsp.stResult.sMessage);
                            } else {
                                report.logHold(2, 1, 301, "", '604:Empty loginRsp');
                            }
                            rspObj.result = loginRsp.stResult.iResult;
                            rspObj.msg = loginRsp.stResult.sMessage;
                            util.debug(3, rspObj.msg, "loginFail");
                        }
                    } catch (ex) {
                        rspObj.result = 604;
                        rspObj.msg = "Error result format:" + ex.message;
                        report.logHold(2, 1, 302, "", rspObj.result + ":" + ex.message);
                        util.debug(4, ex.message, "loginRspError");
                    }
                }
                history.replaceState({}, "", util.delKey(url, 'loginRsp'));
                loginCallBack(rspObj);
            }
        },
        getAvailableLoginType: function (option, callback) {
            var loginTypes = [];
            setAppid(option.appid);
            var getLoginObj = function (loginType) {
                return {
                    loginType: loginType, accInfo: {
                        qbopenid: storage.getItem("qbopenid") || "",//util.getCookie("qbopenid") ||
                        nickName: storage.getItem("nickName") || "",//util.getCookie("nickName") ||
                        avatarUrl: storage.getItem("avatarUrl") || ""//util.getCookie("avatarUrl") ||
                    }
                };
            };


            if (platInfo.pageStage === "wx") { // || platInfo.pageStage === "qb"
                loginTypes.push(getLoginObj("wx"));
            } else {
                loginTypes.push(getLoginObj("qq"));

                if (platInfo.isIos) {
                    loginTypes.push(getLoginObj("guest"));
                }
            }

            var rsp = { result: 0, msg: "", loginTypes: loginTypes };

            callback && callback(rsp);
        },
        /** 提供QQ号码，微信OAuth2.0登录的能力
         *
         * @param option
         *   {String} appid 应用ID，由游戏中心管理
         *   {String} appsig 应用的签名用于验证应用的合法性
         *   {String} appsigData 数据签名
         *   {String} loginType 登陆方式。wx为微信登陆，qq为手Q登陆, qb为手机浏览器登录@@@，guest为游客模式（ios专用）
         *
         * @param callback
         *   {Object} rsp 返回值
         *     {Number} result 为0说明函数执行成功，否则失败
         *     {String} msg 传回的提示信息
         *     {String} qbopenid 用户id
         *     {String} qbopenkey 用户token
         *     {String} refreshToken refreshToken
         *     {String} nickName 用户昵称
         *     {String} avatarUrl 用户头像url
         */
        login: function (option, callback) {
            warnSandbox();
            setAppid(option.appid);
            report.logHold(2, 2);
            var notSupported = { result: 602, msg: "Not supported" };

            if (!platInfo.isIos && option.loginType == 'guest') {
                var ret = { result: 601, msg: "Not in iOS" };
                report.log(2, 1, "", "", ret.result + ":" + ret.msg);
                callback && callback(ret);
                return;
            }

            function reportNotSupported() {
                report.log(2, 1, 301, "", notSupported.result + ":" + notSupported.msg);
            }

            if (option.loginType != 'qq' && option.loginType != 'wx') {
                reportNotSupported();
                callback && callback(notSupported);
                return;
            }
            try {
                storage.setItem("loginType", option.loginType);
            } catch (e) {
                report.tryCatchErr(e);
                util.debug(4, e.message, "NotSupportLocalStorage");
            }
            switch (option.loginType) {
                case 'qq': //用QQ登录
                    ptLogin(option, callback);
                    break;
                case 'wx': //用微信登录
                    switch (platInfo.pageStage) {
                        case "wx"://在微信内
                            wxLogin(option, callback);
                            break;
                        case "qq"://在qq内
                            reportNotSupported();
                            callback && callback(notSupported);
                            break;
                        case "qb"://在qb内
                            qbBrowserLogin(option, callback);
                            break;
                        default:
                            reportNotSupported();
                            callback && callback(notSupported);
                            break;
                    }
                    break;
                default: //其它登录方式
                    reportNotSupported();
                    callback && callback(notSupported);
                    break;
            }
        },
        refreshToken: function (option, callback) {
            warnSandbox();
            setAppid(option.appid);
            report.log(11, 2);
            var winBox = showWindow({
                id: "frmRefreshToken", url: config.proxyurl, visible: false,
                iframeCallback: function (resp) {
                    closeDialog(winBox.container);
                    if (resp && resp.stResult) {
                        resp.stResult = resp.stResult || { iResult: 700, sMessage: "RefreshToken empty" };
                        var rsp = {
                            result: resp.stResult.iResult,
                            msg: resp.stResult.sMessage,
                            qbopenid: option.qbopenid,
                            qbopenkey: resp.sQBOpenKey,
                            rspsig: resp.sRspSig //sQBOpenid、sQBOpenKey、sRefreshToken、sAppid 进行GetDataSig签名计算
                        };
                        report.log(11, 0);
                        callback && callback(rsp);
                    } else {
                        resp = {
                            result: 700,
                            msg: "RefreshToken error:",
                            qbopenid: "",
                            qbopenkey: "",
                            rspsig: ""
                        };
                        report.log(11, 1, 1200, "", resp.result + ":" + resp.msg);
                        util.debug(3, resp.msg);
                        callback && callback(resp);
                    }
                }
            });

            var type = getLoginTypeCode();

            var reqOption = {
                type: 1,
                apiName: "refreshH5",
                data: {
                    sQBOpenid: option.qbopenid,
                    sAppid: option.appid,
                    sRefreshToken: option.refreshToken,
                    sSignature: "", //已过期，保持空值
                    sChannel: setting["channel"],
                    sQBID: "",
                    sID: "", //QQ号/wxopenid
                    stTokenInfo: {
                        iTokenType: type, //type在proxy页面再作换算 2-wx,5-skey,6-lskey
                        sToken: "", //access_token,skey/lskey
                        sAppID: ""
                    }
                }
            };

            if (type == 1) {
                var wxOpenid = localStorage.getItem("wxOpenid");
                var wxOpenkey = localStorage.getItem("wxOpenkey");
                if (wxOpenid && wxOpenkey) {
                    reqOption.wxdata = { wxOpenid: wxOpenid, wxOpenkey: wxOpenkey };
                }
            }

            winBox.iframe.onload = function () {
                util.postMessage(winBox.iframe, config.proxyurl, reqOption);
            };
        },
        logout: function (option, callback) {
            warnSandbox();
            report.log(14, 2);
            var lc = storage;
            var keys = ["qbopenid", "qbopenkey", "refreshToken", "nickName", "avatarUrl"], cseg = '=; expires=' + new Date(0).toUTCString() + "; path=/; domain=" + location.host.substr(location.host.indexOf(".")) + "; "; //uin=; expires=Mon, 26 Jul 1997 05:00:00 GMT; path=/; domain=server.com;
            try {
                for (var k = 0; k < keys.length; k++) {
                    lc.removeItem(keys[k]);
                    document.cookie = keys[k] + cseg;
                }
            } catch (e) {
                report.log(14, 0, 1400, "", "1400:" + e.message);
            }

            //清除qq.com域名
            try {
                var winBox = showWindow({
                    id: "frmLogout",
                    url: config.middleurl + "?act=clear",
                    visible: false,
                    iframeCallback: function (data, source) {
                        var rspObj = { result: 0, msg: "" };
                        report.log(14, 0);
                        callback && callback(rspObj);
                    }
                });
            } catch (e) {
                report.log(14, 0, 1401, "", "1401:" + e.message);
            }
        },
        pay: function (option, callback) {
            warnSandbox();
            report.log(4, 2);
            var orderData = {
                lReqTime: parseInt(option.reqTime),
                sCustomMeta: option.customMeta,
                sMdsAppid: config.mdsAppIDs[getLoginTypeCode()],
                sPayInfo: option.payInfo,
                sPayItem: option.payItem,
                stUserInfo: {
                    sAppSig: option.appsig,
                    sAppid: option.appid,
                    sQBOpenKey: option.qbopenkey,
                    sQBOpenid: option.qbopenid,
                    sUrl: location.href
                },
                sPaySig: option.paysig,
                sChannel: setting["channel"]
            };

            //sdk服务端创建订单
            request({
                type: 1,
                apiName: "createOrderH5",
                data: orderData,
                succCallBack: function (rspOrder) {
                    if (rspOrder) {
                        if (rspOrder.iResult == 0 || rspOrder.iResult == 9) {
                            report.log(4, 0);
                            function payCallBack(rspPay) {

                                //点击充值并购买按钮时
                                if (rspPay) {
                                    var action = rspPay.action;
                                    var checkedCoupon = rspPay.coupons;
                                    var user = {
                                        sAppSig: option.appsig,
                                        sAppid: option.appid,
                                        sQBOpenKey: option.qbopenkey,
                                        sQBOpenid: option.qbopenid,
                                        sUrl: location.href
                                    };
                                    if (action == 1) { //确认支付
                                        report.log(6, 0);
                                        closeDialog(rspPay.holder);
                                        showLoading("正在跳转支付..");

                                        if (rspOrder.iResult === 0) { //余额足
                                            report.log(5, 2);
                                            var banlanceData = {
                                                lReqTime: new Date().getTime(),
                                                sOrderNo: rspOrder.sOrderNo,
                                                stUserInfo: user,
                                                vPaymentCoupon: checkedCoupon ? [checkedCoupon] : []
                                            };

                                            request({
                                                type: 1,
                                                apiName: "receiveDeductConfirmH5",
                                                data: banlanceData,
                                                succCallBack: function (respBalance) {
                                                    hideLoading();
                                                    var retOK = {
                                                        result: respBalance.iResult,
                                                        msg: respBalance.sErrMsg,
                                                        realSaveNum: 0
                                                    };
                                                    report.log(5, 0);
                                                    util.debug(4, retOK);
                                                    callback && callback(retOK);
                                                },
                                                errorCallBack: function (error, errorType) { //sdk服务端创建订单出错
                                                    hideLoading();
                                                    var retError = {
                                                        result: 900,
                                                        msg: "receiveDeductConfirmErr:" + error
                                                    };

                                                    util.debug(4, retError);
                                                    report.log(5, 1, 601, "", retError.result + ":" + retError.msg);
                                                    callback && callback(retError);
                                                }
                                            });

                                        } else if (rspOrder.iResult === 9) { //余额不足
                                            report.log(8, 2);
                                            var winBox = showWindow({
                                                id: "ifrPrepay", url: config.proxyurl, visible: false,
                                                iframeCallback: function (rspMidas) { //确认支付，创建米大师订单回调
                                                    closeDialog(winBox.container);
                                                    rspMidas = rspMidas || { iResult: 1, sErrMsg: "Empty result" };
                                                    if (rspMidas.iResult == 0) { //创建米大师订单成功，返回支付url @@@!!!
                                                        report.log(8, 0);

                                                        //米大师支付
                                                        report.log(9, 2);
                                                        if (getLoginTypeCode() == 1) { //微信支付
                                                            if (typeof (window.h5sdk) != "undefined" && window.h5sdk.init) {
                                                                var param = {
                                                                    from_h5: 1,
                                                                    zoneid: 1,
                                                                    pf: unescape(util.getKey("pf", rspMidas.sMdsPayUrl)),
                                                                    pfkey: "pfkey",
                                                                    appid: config.mdsAppIDs[getLoginTypeCode()],
                                                                    type: "goods",
                                                                    goodstokenurl: unescape(util.getKey("params", rspMidas.sMdsPayUrl)),
                                                                    buy_quantity: 1,
                                                                    session_id: "hy_gameid",
                                                                    session_type: "wc_actoken",
                                                                    openid: "",
                                                                    openkey: "",
                                                                    direct_pay_channel: "wechat"//,
                                                                    //dev: 1
                                                                };

                                                                param = getMidasAuthObject(param, rspMidas.user);
                                                                //hideLoading();
                                                                var sandbox = config.sandbox ? true : false;
                                                                var opt = {
                                                                    //sandbox: true,//是否调用米大师的沙箱环境
                                                                    https: false,
                                                                    hide_ui: true,
                                                                    methods: {
                                                                        onready: function () {
                                                                            h5sdk.remote.setBuyInfo(param);
                                                                            hideLoading();
                                                                        },
                                                                        oncanpay: function () {
                                                                            hideLoading();
                                                                        },
                                                                        onError: function (code, errMsg) {
                                                                            hideLoading();
                                                                            switch (code) {
                                                                                case 1000://参数错误
                                                                                    //alert(errMsg);
                                                                                    break;
                                                                            }
                                                                            var retEnd = { result: code, msg: errMsg };
                                                                            util.debugResult(3, retEnd, "MdsOnError");
                                                                            report.log(9, 1, 1001, param.appid, code + ":" + errMsg);
                                                                            callback && callback(retEnd);
                                                                        },
                                                                        onPayEnd: function (code, msg) {
                                                                            hideLoading();
                                                                            var msgResult = "";
                                                                            switch (code) {
                                                                                case 2:
                                                                                    msgResult = '系统处理中...';
                                                                                    break;
                                                                                case 1:
                                                                                    msgResult = '购买成功';
                                                                                    break;
                                                                                case 0:
                                                                                    msgResult = '支付过程中断';
                                                                                    break;
                                                                                case 3:
                                                                                    msgResult = '支付成功,发货有延时';
                                                                                    break;
                                                                                case -1:
                                                                                    msgResult = '购买失败';
                                                                                    break;
                                                                                case 4:
                                                                                    msgResult = '用户仍有待支付订单';
                                                                                    break;
                                                                                case -2:
                                                                                    msgResult = '充值成功，购买失败';
                                                                                    break;
                                                                                default:
                                                                                    msgResult = 'errcode:' + code + '\nmsg:' + msg;
                                                                                    break;
                                                                            }
                                                                            if (code == 1) {
                                                                                code = 0;
                                                                                report.log(9, 0);
                                                                            } else {
                                                                                code = "90000" + "-" + code;
                                                                                report.log(9, 1, 1001, param.appid, code + ":" + msg);
                                                                            }

                                                                            var retEnd = { result: code, msg: msgResult };
                                                                            util.debugResult(3, retEnd, "MdsOnPayEnd");
                                                                            callback && callback(retEnd);
                                                                        }
                                                                    }
                                                                };
                                                                util.debug(2, JSON.stringify(opt) + " | " + JSON.stringify(param), "payMdsOption " + config.loginType);
                                                                window.h5sdk.init(opt, param);
                                                            } else {
                                                                var retOK = { result: 902, msg: "MidasJSEmpty" };
                                                                util.debugResult(3, retOK, "Mds");
                                                                report.log(9, 1, 1001, param.appid, retOK.result + ":" + retOK.msg);
                                                                callback && callback(retOK);
                                                            }
                                                        } else {
                                                            //米大师自己实现iframe内嵌米大师支付页
                                                            if (typeof (Midas) != "undefined") {
                                                                var hasPay = 0;
                                                                var mdsOptions = {
                                                                    params: unescape(util.getKey("params", rspMidas.sMdsPayUrl)),
                                                                    pf: unescape(util.getKey("pf", rspMidas.sMdsPayUrl)),
                                                                    sandbox: unescape(util.getKey("sandbox", rspMidas.sMdsPayUrl)),
                                                                    onSuccess: function () {
                                                                        var retOK = {
                                                                            result: 0,
                                                                            msg: "",
                                                                            realSaveNum: 0
                                                                        };
                                                                        hasPay = 1;
                                                                        util.debugResult(3, retOK, "MdsBuyGoodsOK");
                                                                        report.log(9, 0);
                                                                        callback && callback(retOK);
                                                                    },
                                                                    onClose: function () {
                                                                        if (!hasPay) {
                                                                            hasPay = 0;
                                                                            var rspClose = {
                                                                                result: 7,
                                                                                msg: "Cancel",
                                                                                realSaveNum: 0
                                                                            };
                                                                            util.debugResult(3, rspClose, "MdsBuyGoodsOnClose");
                                                                            report.log(9, 1, 1000, config.mdsAppIDs[getLoginTypeCode()], rspClose.result + ":" + rspClose.msg);
                                                                            callback && callback(rspClose);
                                                                        }
                                                                    }
                                                                };

                                                                if (config.loginType == "wx") {
                                                                    mdsOptions["sessionid"] = "hy_gameid";
                                                                    mdsOptions["sessiontype"] = "wc_actoken";
                                                                } else {
                                                                    mdsOptions["sessionid"] = "openid";
                                                                    mdsOptions["sessiontype"] = "kp_accesstoken"; //kp_accesstoken QQ
                                                                }
                                                                if (rspMidas.user) {
                                                                    mdsOptions["openid"] = rspMidas.user["openid"] || "";
                                                                    mdsOptions["openkey"] = rspMidas.user["openkey"] || "";
                                                                }
                                                                util.debug(2, JSON.stringify(mdsOptions), "payMdsOption " + config.loginType);
                                                                hideLoading();
                                                                //mdsOptions.pf = 'desktop_m_guest-m_qq-2001-android-2011-h5sdk';
                                                                Midas.buyGoods(mdsOptions);
                                                            } else {
                                                                var retOK = { result: 902, msg: "MidasJSEmpty" };
                                                                util.debugResult(3, retOK, "Mds");
                                                                report.log(9, 1, 1001, config.mdsAppIDs[getLoginTypeCode()], retOK.result + ":" + retOK.msg);
                                                                callback && callback(retOK);
                                                            }
                                                        }

                                                    } else { //创建米大师订单出错
                                                        if (rspMidas.iResult == 1 && rspMidas.sErrMsg == "check request params err")
                                                            rspMidas.iResult = 19;
                                                        //toast("创建米大师订单失败！(" + rsp.iResult + ",msg:" + rsp.sErrMsg + ")");
                                                        hideLoading();
                                                        var resp = {
                                                            result: rspMidas.iResult,
                                                            msg: rspMidas.sErrMsg
                                                        };
                                                        var msg = 'CreateMdsOrdErr:' + rspMidas.sErrMsg;
                                                        report.log(8, 1, 900, "", resp.result + ":" + resp.msg);
                                                        util.debugResult(3, resp, "CreateMdsOrdErr");
                                                        callback && callback(resp);
                                                    }
                                                }
                                            });

                                            var id = "", key = "";
                                            if (config.loginType == "wx") {
                                                var wxOpenid = localStorage.getItem("wxOpenid");
                                                var wxOpenkey = localStorage.getItem("wxOpenkey");
                                                if (wxOpenid && wxOpenkey) {
                                                    id = wxOpenid;
                                                    key = wxOpenkey;
                                                }
                                            }

                                            //showWindow("pay", null, url, callback); //米大师支付成功后，跳转到自定义的成功页，该成功页postMessage执行callback回调，到用户。
                                            var reqOption = {
                                                type: 1,//formPostIframe
                                                apiName: "createMidasOrderH5", //createH5JsMidasOrder
                                                data: {
                                                    lReqTime: parseInt(option.reqTime),
                                                    sOrderNo: data.orderno,
                                                    stMidasParams: {
                                                        sOpenid: id,
                                                        sOpenkey: key,
                                                        sPayToken: "",
                                                        sPf: "wx_m_wx-2001-html5-2011-h5sdk",
                                                        sPfkey: "pfkey"
                                                    },
                                                    stUserInfo: user,
                                                    vPaymentCoupon: checkedCoupon,
                                                    sChannel: setting["channel"]
                                                },
                                                loginType: config.loginType
                                            };

                                            winBox.iframe.onload = function () {
                                                util.postMessage(winBox.iframe, config.proxyurl, reqOption);
                                            };
                                            //request(reqOption);
                                        }

                                    } else if (action == 2) {  //取消支付
                                        report.log(6, 1, 701, 2);
                                        var reqOption = {
                                            type: 1,
                                            apiName: "userCancelOrderH5",
                                            data: {
                                                sOrderNo: data.orderno,
                                                stUserInfo: user,
                                                sChannel: setting["channel"]
                                            },
                                            succCallBack: function (rsp) {
                                                //rsp && (rsp.iResult == 0) &&
                                                closeDialog(rspPay.holder);
                                                var resp = { result: 903, msg: "CancelPayment" };
                                                report.log(6, 1, 701, 0);
                                                callback && callback(resp);
                                            },
                                            errorCallBack: function (error, errorType) { //sdk服务端创建订单出错
                                                var msg = "CancelPaymentErr:" + error;
                                                var resp = { result: 904, msg: msg };
                                                report.log(6, 1, 701, 1, resp.result + ":" + resp.msg);
                                                util.debug(3, msg);
                                                callback && callback(resp);
                                            }
                                        };
                                        request(reqOption);
                                    }
                                } else {
                                    var resp = { result: 902, msg: "Empty midas action result" };
                                    util.debug(3, resp.msg);
                                    report.log(6, 1, 702, 2);
                                    callback && callback(resp);
                                }
                            }

                            //显示余额、代金券选择及支付确认
                            try {
                                report.log(6, 2);
                                var data = {
                                    id: "frmPayInfo",
                                    title: option.payInfo,
                                    coin: rspOrder.lCoin + rspOrder.lCentCoin / 10, //余额
                                    payAmount: rspOrder.lPayAmount + rspOrder.lPayCentAmount / 10,//支付金额
                                    payCentAmount: rspOrder.lPayAmount / rspOrder.lRmbExchange,//支付金额分
                                    rmbPayAmount: rspOrder.lRmbPayAmount / rspOrder.lRmbExchange,//需支付人民币
                                    exchange: rspOrder.lRmbExchange,//汇率
                                    orderno: rspOrder.sOrderNo, //订单号
                                    coupons: rspOrder.vCouponInfo, //代金券
                                    callback: payCallBack
                                };
                            } catch (e) {
                                report.log(6, 1, 700, "", "700:" + e.message);
                            }
                            showDialog(data);

                        } else {
                            if (rspOrder.sErrMsg == "order error, ErrorCode(1101)") {
                                rspOrder.iResult = -3;//与终端的保持一致
                                rspOrder.sErrMsg = "need login";
                            }
                            var retOK = { result: rspOrder.iResult, msg: rspOrder.sErrMsg };
                            util.debugResult(3, retOK, "CreateOrdErr");
                            report.log(4, 1, 500, "", retOK.result + ":" + retOK.msg);
                            callback && callback(retOK);
                        }
                    } else {
                        var retFail = { result: 901, msg: "EmptyResult" };
                        report.log(4, 1, 500, "", retFail.result + ":" + retFail.msg);
                        util.debugResult(3, retFail, "CreateOrd");
                        callback && callback(retFail);
                    }
                },
                errorCallBack: function (error, errorType) { //sdk服务端创建订单出错
                    var retError = { result: 900, msg: "Create order error:" + error };
                    report.log(4, 1, 501, "", retError.result + ":" + retError.msg);
                    util.debugResult(3, retError, "PayErrorCallBack");
                    callback && callback(retError);
                }
            });
        },
        recharge: function (option, callback) {
            warnSandbox();
            var expand = "recharge";
            report.log(15, 2, "", expand);

            var user = {
                sAppSig: option.appsig || "",
                sAppid: option.appid,
                sQBOpenKey: option.qbopenkey,
                sQBOpenid: option.qbopenid,
                sUrl: location.href
            };

            var orderData = {
                lReqTime: parseInt(option.reqTime),
                //sCustomMeta: option.customMeta,
                sMdsAppid: config.mdsAppIDs[0],// getLoginTypeCode()
                sGQBId: option.amount,
                //sPayInfo: option.payInfo,
                //sPayItem: option.payItem,
                stUserInfo: user,
                sPaySig: option.paysig,
                sChannel: setting["channel"]
            };

            //sdk服务端创建订单
            request({
                type: 1,
                apiName: "createRechargeOrderH5",
                data: orderData,
                succCallBack: function (rspOrder) {
                    if (rspOrder) {
                        if (rspOrder.iResult == 0) {
                            report.log(15, 0, "", expand);
                            var winBox = showWindow({
                                id: "ifrPrepay",
                                url: config.proxyurl,
                                visible: false,
                                iframeCallback: function (rspMidas) { //确认支付，创建米大师订单回调
                                    closeDialog(winBox.container);
                                    rspMidas = rspMidas || { iResult: 1, sErrMsg: "Empty result" };

                                    if (rspMidas.iResult == 0) { //创建米大师订单成功，返回支付url @@@!!!
                                        report.log(16, 0, "", expand);

                                        report.log(17, 2, "", expand);
                                        //米大师自己实现iframe内嵌米大师支付页
                                        if (typeof (Midas) != "undefined") {
                                            var hasPay = 0;
                                            var mdsOptions = {
                                                params: unescape(util.getKey("params", rspMidas.sMdsPayUrl)),
                                                pf: unescape(util.getKey("pf", rspMidas.sMdsPayUrl)),
                                                _version: "v3",//带支付回调
                                                sandbox: unescape(util.getKey("sandbox", rspMidas.sMdsPayUrl)),
                                                onSuccess: function () {
                                                    var retOK = { result: 0, msg: "", realSaveNum: 0 };
                                                    hasPay = 1;
                                                    util.debugResult(3, retOK, "MdsBuyGoodsOK");
                                                    report.log(17, 0, "", expand);
                                                    callback && callback(retOK);
                                                },
                                                onClose: function () {
                                                    if (!hasPay) {
                                                        hasPay = 0;
                                                        var rspClose = { result: 7, msg: "Cancel", realSaveNum: 0 };
                                                        util.debugResult(3, rspClose, "MdsBuygoodsOnClose");
                                                        report.log(17, 1, 1000, expand, rspClose.result + ":" + rspClose.msg);
                                                        callback && callback(rspClose);
                                                    }
                                                }
                                            };

                                            mdsOptions = getMidasAuthObject(mdsOptions, rspMidas.user);
                                            util.debug(2, JSON.stringify(mdsOptions), "Midas.buyGoods() Options");
                                            hideLoading();
                                            Midas.buyGoods(mdsOptions);
                                        } else {
                                            var rspClose = { result: 7, msg: "MidasUndefined" };
                                            report.log(17, 1, 1000, expand, rspClose.result + ":" + rspClose.msg);
                                        }
                                    } else { //创建米大师订单出错
                                        //toast("创建米大师订单失败！(" + rsp.iResult + ",msg:" + rsp.sErrMsg + ")");
                                        hideLoading();
                                        var resp = { result: rspMidas.iResult, msg: rspMidas.sErrMsg };
                                        var msg = 'CreateMdsOrdErr:' + rspMidas.sErrMsg;
                                        report.log(16, 1, "", expand, resp.result + ":" + resp.msg);
                                        util.debugResult(3, resp, "CreateMdsOrdErr");
                                        callback && callback(resp);
                                    }
                                }
                            });

                            var mdsOptions = getMidasAuthObject({}, null);
                            //showWindow("pay", null, url, callback); //米大师支付成功后，跳转到自定义的成功页，该成功页postMessage执行callback回调，到用户。
                            var reqOption = {
                                type: 1,//formPostIframe
                                apiName: "createMidasOrderH5", //createH5JsMidasOrder
                                data: {
                                    lReqTime: parseInt(option.reqTime),
                                    sOrderNo: rspOrder.sOrderNo,
                                    stMidasParams: {
                                        sOpenid: mdsOptions["openid"] || "",
                                        sOpenkey: mdsOptions["openkey"] || "",
                                        sPayToken: "",
                                        sPf: "wx_m_wx-2001-html5-2011-h5sdk",
                                        sPfkey: "pfkey"
                                    },
                                    stUserInfo: user,
                                    vPaymentCoupon: [],
                                    sChannel: setting["channel"]
                                },
                                loginType: config.loginType
                            };
                            util.debug(2, JSON.stringify(reqOption), "MidasOrderCreateOption");
                            util.debug(2, JSON.stringify(config), "config");
                            winBox.iframe.onload = function () {
                                util.postMessage(winBox.iframe, config.proxyurl, reqOption);
                            };
                            report.log(16, 2, "", expand);
                        } else {
                            if (rspOrder.sErrMsg == "order error, ErrorCode(1101)") {
                                rspOrder.iResult = -3;//与终端的保持一致
                                rspOrder.sErrMsg = "need login";
                            }
                            var retOK = { result: rspOrder.iResult, msg: rspOrder.sErrMsg };
                            report.log(15, 1, 1601, expand, retOK.result + ":" + retOK.msg);
                            util.debugResult(3, retOK, "CreateRechargeOrdErr");
                            callback && callback(retOK);
                        }
                    } else {
                        var retFail = { result: 901, msg: "EmptyOrderResult" };
                        report.log(15, 1, 1600, expand, retFail.result + ":" + retFail.msg)
                        util.debugResult(3, retFail, "CreateRechargeOrdErr");
                        callback && callback(retFail);
                    }
                },
                errorCallBack: function (error, errorType) { //sdk服务端创建订单出错
                    var retError = {
                        result: 900,
                        msg: "CreateRechargeOrdErr:" + error + ",option:" + JSON.stringify(option)
                    };
                    report.log(15, 1, 1601, expand, retError.result + ":" + retError.msg)
                    util.debugResult(3, retError);
                    callback && callback(retError);
                }
            });
        },
        getGameFriends: function (option, callback) {
            warnSandbox();
            report.log(12, 2);
            var winBox = showWindow({
                id: "frmFriend", url: config.proxyurl, visible: false,
                iframeCallback: function (rsp) {
                    closeDialog(winBox.container);
                    if (rsp && rsp.stResult) {
                        if (rsp.stResult.iResult == 0) {
                            report.log(12, 0);
                            var friends = (Array.isArray(rsp.vQBOpenid) && rsp.vQBOpenid) || [];
                            var rspObj = { result: 0, msg: "", friends: friends };
                            callback && callback(rspObj);
                        } else {
                            var rspObj = {
                                result: rsp.stResult.iResult,
                                msg: "Get friends fail:" + rsp.stResult.sMessage
                            };
                            report.log(12, 1, 1301, "", rspObj.result + ":" + rspObj.msg);
                            util.debug(3, rspObj.msg);
                            callback && callback(rspObj);
                        }
                    } else {
                        var rspObj = { result: 3000, msg: "Get friends error" };
                        report.log(12, 1, 1300, "", rspObj.result + ":" + rspObj.msg);
                        util.debug(3, rspObj.msg);
                        callback && callback(rspObj);
                    }
                }
            });

            var type = getLoginTypeCode();

            var reqOption = {
                type: 1,//formPostIframe
                apiName: "getFriendsH5",
                data: {
                    sAppid: option.appid,
                    sQBOpenKey: option.qbopenkey,
                    sQBOpenid: option.qbopenid,
                    sSignature: "",
                    stToken: { iType: type, sToken: "" },
                    sChannel: setting["channel"]
                }
            };

            winBox.iframe.onload = function () {
                util.postMessage(winBox.iframe, config.proxyurl, reqOption);
            };
        },
        share: function (option, callback) {
            // 1:微信 ; 8 :朋友圈; 3: qq空间 ; 4:qq好友 ; 0: 显示面板
            if (!option.toApp || option.toApp == 0) {
                if ($qclass("h5gameshare").length > 0) {
                    hideShare();
                    var ret = { result: 4001, msg: "Cancel share" };
                    report.log(1, 1, 100, option.toApp, ret.result + ":" + ret.msg);
                    callback && callback();
                    return;
                }

                report.log(1, 2, 0, option.toApp);
                if (platInfo.isWX) {
                    shareApp(option, callback);
                } else {
                    showShare({
                        wx: false,
                        wp: false,
                        qq: true,
                        qz: true
                    }, option, callback);
                }
            } else {
                report.log(1, 2, 0, option.toApp);
                shareApp(option, callback);
            }
        },
        authorizeCancel: function () {
        },
        authorizeConfirm: function () {
        },
        exit: function () {
        },
        getUserInfo: function () {
        },
        openTopicCircle: function () {
        },
        preloadResource: function () {
        },
        run: function () {
        },
        sendToDesktop: function () {
        },
        version: function () {
        }
    };
    qcore.util = util;
    this.prototype = qcore;

    !function () {
        //获取渠道号
        var chn = util.getKey(chnName);
        if (chn) {
            storage.removeItem(chnName);
            storage.setItem(chnName, chn);
        } else {
            chn = storage.getItem(chnName);
        }
        setting["channel"] = chn || "000000"; //默认渠道

        var lt = util.getKey("lgtp");
        config.lgtp = parseInt(lt || 1);
        var lv = util.getKey("lglv");
        config.lglv = parseInt(lv || config.lglv);
        config.sandbox = util.getKey("sandbox") || config.sandbox;
        qcore.sandbox = config.sandbox;
        config.loginType = localStorage.getItem("loginType") || "qq";

        var type = getLoginTypeCode();
        util.loadJs(config.mdsUrls[type], function () {
        });
        if (type == 1) { //微信下也加载弹窗版兼容 同时兼容支付接口 和 充值接口
            util.loadJs(config.mdsUrls[0], function () {
            });
        }

        if (location.href.indexOf("#rd") > 1) {
            history.replaceState(null, "", location.pathname + location.search);
        }

        report.logLazyReport();//上报未上报的日志

        addCSSToHead();//添加样式表
    }();

    return qcore;
})
    ();
window.browser = window.browser || {};
window.browser.x5gameplayer = window.QBH5 = QBH5;
