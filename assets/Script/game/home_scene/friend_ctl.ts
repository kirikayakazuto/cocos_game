import ugame from "../ugame";

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
    }

    sync_info() {
        this.unick.string = ugame.unick;    
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
