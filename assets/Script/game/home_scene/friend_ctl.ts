import ugame from "../ugame";
import auth from "../protobufs/auth";
import talk_room from "../protobufs/talk_room";
import Response from "../Response";
import utalk from "../utalk";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    unick: cc.Label = null;

    @property(cc.Node)
    main_list: cc.Node = null;
    @property(cc.Node)
    back: cc.Node = null;
    @property(cc.Label)
    title_label: cc.Label = null;
    @property(cc.Node)
    request_friends: cc.Node = null;
    @property(cc.Node)
    content_node: cc.Node = null;


    @property(cc.Prefab)
    add_friend_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    request_auth_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    friend_info_item: cc.Prefab = null;
    @property(cc.Prefab)
    talk_room_prefab: cc.Prefab = null;

    // 二级页面
    second_ui: cc.Node = null;

    friend_list: Array<any> = [];

    // LIFE-CYCLE CALLBACKS:
    list_scroll: cc.Node = null;

    onLoad () {
        this.list_scroll = this.node.getChildByName("list");
        this.list_scroll.on("bounce-top", this.drop_down_refresh, this);
        talk_room.enter_talk();
    }
 
    start () {
        this.sync_info();
        this.send_request_friends();
        this.get_online_friends();

    }
    // 下拉刷新
    drop_down_refresh() {
        this.get_online_friends();
    }
    
    /**
     * 获取现在好友
     */
    get_online_friends() {
        talk_room.get_online_friends();
    }
    /**
     * 显示在线好友
     */
    show_online_friends(body: any) {
        if(body[0] != Response.OK) {
            console.log("show_online_friends error: " ,body[0]);
            return ;
        }
        for(let i=0; i<this.content_node.children.length; i++) {
            for(let j=0; j<body[1].length; j++) {
                
                if(this.content_node.children[i]["uname"] == body[1][j]) {
                    this.content_node.children[i].getChildByName("status").color = new cc.Color(0, 0, 255, 255);
                }
            }
        }
    }
    /**
     * 加载完成发送一次好友列表刷新请求 当用户点击验证请求是在发送一次
     */
    send_request_friends() {
        auth.get_friends_request();
    }

    sync_info() {
        this.unick.string = ugame.unick;    
    }
    /**
     * 显示请求验证数量
     * @param num 
     */
    show_request_friend_num(num: number) {
        this.request_friends.getChildByName("str").getComponent(cc.Label).string = "" + num
        this.request_friends.getChildByName("str").active = true;
    }
    /**
     * 显示好友列表
     */
    show_friends_list(friend_list: Array<any>) {
        this.friend_list = friend_list;
        for(let i=0; i<friend_list.length; i++) {
            let node = cc.instantiate(this.friend_info_item);
            node.getChildByName("uinck").getComponent(cc.Label).string = friend_list[i].unick;
            node.getChildByName("status").color = new cc.Color(112, 128, 144, 255);
            // 蓝色 0 0 255 红色 255 0 0
            node["uname"] = this.friend_list[i].uname;

            let clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node; //这个 node 节点是你的事件处理代码组件所属的节点
            clickEventHandler.component = "friend_ctl";//这个是代码文件名
            clickEventHandler.handler = "show_talk_room_panel";
            clickEventHandler.customEventData = "" + i;

            let button = node.getComponent(cc.Button);
            button.clickEvents.push(clickEventHandler);

            node.parent = this.content_node;
        }
    }
    /**
     * 添加好友
     */
    add_friends_button_click() {
        this.second_ui = cc.instantiate(this.add_friend_prefab);
        this.second_ui.parent = this.node;

        this.hide_main_list("添加好友");
    }
    /**
     * 显示历史聊天记录
     * @param body 
     */
    show_history_talk_msg(body: any) {
        if(body[0] != Response.OK) {
            console.log("show_history_talk_msg error: ", body[0]);
            return ;
        }
        this.content_node.removeAllChildren();
        let talk_msg = body[1];
        let talk_msg_ctl = this.second_ui.getComponent("talk_room_panel");
        for(let i=0; i<talk_msg.length; i++) {
            if(talk_msg[i][0] == "self") {
                talk_msg_ctl.show_self_talk_msg(talk_msg[i][2]);
            }else if(talk_msg[i][0] == "other") {
                talk_msg_ctl.show_other_talk_msg(talk_msg[i][2]);
            }
        }
    }
    /**
     * 显示聊天界面
     */
    show_talk_room_panel(e, data) {
        this.second_ui = cc.instantiate(this.talk_room_prefab);
        this.second_ui.getComponent("talk_room_panel").init(this.friend_list[data].uname);
        // 加载聊天内容
        let talk_msg = utalk.get_unread_msg_by_fname(this.friend_list[data].uname);
        
        if(talk_msg) {
            for(let i=0; i<talk_msg.length; i++) {
                if(talk_msg[i].who == "self") {
                    this.second_ui.getComponent("talk_room_panel").show_self_talk_msg(talk_msg[i].msg);
                }else if(talk_msg[i].who == "other") {
                    this.second_ui.getComponent("talk_room_panel").show_other_talk_msg(talk_msg[i].msg);
                }
            }
        }
        this.second_ui.parent = this.node;

        this.hide_main_list(this.friend_list[data].unick);
    }
    /**
     * 验证请求
     */
    request_auth_button_click() {
        this.second_ui = cc.instantiate(this.request_auth_prefab);
        this.second_ui.parent = this.node;

        this.hide_main_list("验证请求");
    }

    /**
     * 清除输入框
     */
    clear_exitbox_input(body) {
        if(body != Response.OK) {
            console.log("clear_exitbox_input error: ", body);
            return ;
        }
        let node = this.node.getChildByName("talk_room");
        if(node) {
            node.getComponent("talk_room_panel").clear_exitbox_input();
        }
    }
    
    /**
     * 展示聊天内容
     *  "other",
        uplayer.unick,
        uplayer.uname,
        msg,
        time
     */
    show_talk_msg(body: any) {
        // 将数据保存到 utalk
        utalk.save_talk_msg(body);

        let node = this.node.getChildByName("talk_room");
        if(!node) {
            return ;
        }
        if(node.getComponent("talk_room_panel").get_fname() != body[1]) {
            return ;
        }
        if(body[0] == "self") {    // 自己发送的
            node.getComponent("talk_room_panel").show_self_talk_msg(body[2]);
        }else if(body[0] == "other") { // 其他人
            node.getComponent("talk_room_panel").show_other_talk_msg(body[2]);
        }
    }

    // 删除请求玩家信息
    delete_request_list_by_uname(uname: string) {
        let node = this.node.getChildByName("request_auth_panel");
        if(node) {
            node.getComponent("request_auth_panel").remove_item_by_uname(uname);
        }
    }
    /**
     * 显示好友
     */
    show_friend_info_item(friend_info: any) {
        let node = this.node.getChildByName("add_friend_panel");
        if(node) {
            node.getComponent("add_friend_panel").show_friend_info(friend_info);
        }
    }
    /**
     * 添加好友的结果
     */
    show_add_friends_result(status: number) {
        let node = this.node.getChildByName("add_friend_panel");
        if(node) {
            node.getComponent("add_friend_panel").show_add_friends_result(status);
        }
    }


    // 显示主ui
    show_main_list() {
        this.back.active = false;
        this.main_list.active = true;
        this.title_label.string = "好友";
    }
    hide_main_list(title: string) {
        this.back.active = true;
        this.main_list.active = false;
        this.title_label.string = title;
    }

    go_back() {
        if(this.second_ui != null) {
            this.second_ui.removeFromParent();
            this.second_ui = null;
        }
        this.show_main_list();
    }

    // update (dt) {}
}


