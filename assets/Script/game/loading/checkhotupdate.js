import http from "../../modules/http.js";

cc.Class({
    extends: cc.Component,

    properties: {
        
        url: "http://127.0.0.1:10001",
    },

    // use this for initialization
    onLoad: function () {

    },

    set_hotupdate_search_path: function() {
        var path = jsb.fileUtils.getSearchPaths();
        var write_path = this._storagePath;
        var hotpath = write_path + "/hotupdate";
        if (!jsb.fileUtils.isDirectoryExist(hotpath)) {
            jsb.fileUtils.createDirectory(hotpath);
        }    
        path.unshift(hotpath);
        jsb.fileUtils.setSearchPaths(path);

        this.hotpath = hotpath;
    }, 
    
    local_hotupdate_download_list: function(hotpath) {
        var json = {};
        var str;
        
        if (jsb.fileUtils.isFileExist(hotpath + "/hotupdate.json")) {  
            str = jsb.fileUtils.getStringFromFile(hotpath + "/hotupdate.json");
            json = eval('(' + str + ')');
        }
        
        return json;
    }, 

    download_item: function(write_path, server_item, end_func) {
        if (server_item.file.indexOf(".json") >= 0) {
            http.get(this.url, "/" + server_item.file, null, function(err, data) {
                if (err) {
                    if (end_func) {
                        end_func();
                    }
                    return;
                }

                {
                    var dir_array = new Array(); //定义一数组 
                    dir_array = server_item.dir.split("/");
                    var walk_dir = write_path;

                    for(var j = 0; j < dir_array.length; j ++) {
                        walk_dir = walk_dir + "/" + dir_array[j];
                        if (!jsb.fileUtils.isDirectoryExist(walk_dir)) {
                            jsb.fileUtils.createDirectory(walk_dir);
                        }
                    }
                    jsb.fileUtils.writeStringToFile(data, write_path + "/" + server_item.file);
                }    
                if (end_func) {
                    end_func();
                }
            });
        }
        else {
            http.download(this.url, "/" + server_item.file, null, function(err, data) {
                if (err) {
                    if (end_func) {
                        end_func();
                    }
                    return;
                }

                {
                    var dir_array = new Array(); //定义一数组 
                    dir_array = server_item.dir.split("/");
                    var walk_dir = write_path;

                    for(var j = 0; j < dir_array.length; j ++) {
                        walk_dir = walk_dir + "/" + dir_array[j];
                        if (!jsb.fileUtils.isDirectoryExist(walk_dir)) {
                            jsb.fileUtils.createDirectory(walk_dir);
                        }
                    }
                    jsb.fileUtils.writeDataToFile(data, write_path + "/" + server_item.file);
                }

                if (end_func) {
                    end_func();
                }
            });
        }
        
    },

    start: function() {
        console.log("hotupdate start");
        
        this._storagePath = jsb.fileUtils.getWritablePath();

    console.log(this._storagePath);
    console.log("end..");
        // 设置一下搜索路径
        this.set_hotupdate_search_path();
        // end 
        // json 对象
        var now_list = this.local_hotupdate_download_list(this.hotpath);
    console.log(now_list);
    console.log("end..");
        var server_list = null;

        http.get(this.url, "/hotupdate/hotupdate.json", null, function(err, data) {
    console.log(data);
    console.log("end...");
            if (err) {
                this.node.removeFromParent();
                return;
            }
            console.log(data);
            server_list = eval('(' + data + ')');
            
            var i = 0;
            var download_array = [];
            for(var key in server_list) {
                if (now_list[key] && now_list[key].md5 === server_list[key].md5) {
                    continue;
                }

                download_array.push(server_list[key]);
            }

            if (download_array.length <= 0) {
                
                console.log("下载列表为空");
                this.node.removeFromParent();
                return;
            }

            
            var i = 0;
            var callback = function() {
                i ++;
                if (i >= download_array.length) {
                    jsb.fileUtils.writeStringToFile(data, this.hotpath + "/hotupdate.json");
                    this.node.removeFromParent();
                    
                    cc.audioEngine.stopAll();
                    cc.game.restart();
                    return;
                }

                this.download_item(this._storagePath, download_array[i], callback);
            }.bind(this);

            this.download_item(this._storagePath, download_array[i], callback);
        }.bind(this));
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
