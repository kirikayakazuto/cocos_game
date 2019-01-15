import ugame from "../ugame";
import auth from "../protobufs/auth";
import talk_room from "../protobufs/talk_room";

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

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        talk_room.enter_talk();
    }

    start () {
        this.sync_info();
        this.send_request_friends();
        this.get_online_friends();

    }
    /**
     * 获取现在好友
     */
    get_online_friends() {
        talk_room.get_online_friends();
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
     * 显示好友请求列表
     * 暂无作用
     * @param friends_list 
     */
    /* show_request_friends_list(friend_list: any) {
        let node = this.node.getChildByName("request_auth_prefab");
        if(node) {
            node.getComponent("request_auth_prefab").show_uinfo_item(friend_list);
        }
    } */

    
    /**
     * 显示好友列表
     */
    show_friends_list(friend_list: Array<any>) {
        for(let i=0; i<friend_list.length; i++) {
            let node = cc.instantiate(this.friend_info_item);
            node.getChildByName("uinck").getComponent(cc.Label).string = friend_list[i].unick;
            node.getChildByName("status").color = new cc.Color(112, 128, 144, 255);
            // 蓝色 0 0 255 红色 255 0 0
    

            let clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node; //这个 node 节点是你的事件处理代码组件所属的节点
            clickEventHandler.component = "friend_ctl";//这个是代码文件名
            clickEventHandler.handler = "show_talk_room_panel";
            clickEventHandler.customEventData = "" + friend_list[i].unick;

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
     * 显示聊天界面
     */
    show_talk_room_panel(e, data) {
        this.second_ui = cc.instantiate(this.talk_room_prefab);
        this.second_ui.parent = this.node;

        this.hide_main_list(data);
    }
    /**
     * 验证请求
     */
    request_auth_button_click() {
        this.second_ui = cc.instantiate(this.request_auth_prefab);
        this.second_ui.parent = this.node;

        this.hide_main_list("验证请求");
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


