import ugame from "../ugame";
import auth from "../protobufs/auth";

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

    @property(cc.Prefab)
    add_friend_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    request_auth_prefab: cc.Prefab = null;

    // 二级页面
    second_ui: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.sync_info();
        this.send_request_friends();
    }
    /**
     * 加载完成发送一次好友列表刷新请求 当用户点击验证请求是在发送一次
     */
    send_request_friends() {
        auth.send_friends_request();
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

    show_request_friends_list(friends_list: any) {

    }
    /**
     * 显示好友列表
     */
    show_friends_list(friend_list: any) {
        let node = this.node.getChildByName("request_auth_prefab");
        if(node) {
            node.getComponent("request_auth_prefab").show_uinfo_item(friend_list);
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
     * 验证请求
     */
    request_auth_button_click() {
        this.second_ui = cc.instantiate(this.request_auth_prefab);
        this.second_ui.parent = this.node;

        this.hide_main_list("验证请求");
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
        this.title_label.string = "我";
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


