import ugame from "../ugame";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    unick: cc.Label = null;
    @property(cc.Node)
    guest_bind_button: cc.Node = null;

    @property(cc.Prefab)
    edit_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    guest_upgrade_prefab: cc.Prefab = null;

    @property(cc.Node)
    main_list: cc.Node = null;
    @property(cc.Node)
    back: cc.Node = null;
    @property(cc.Label)
    title_label: cc.Label = null;
    // 二级页面
    second_ui: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    
    start () {
        this.sync_info();
        this.back.active = false;
        
        console.log(ugame.is_guest);

        if(ugame.is_guest) {
            this.guest_bind_button.active = true;
        }else {
            this.guest_bind_button.active = false;
        }
    }

    // 返回
    go_back() {
        if(this.second_ui != null) {
            this.second_ui.removeFromParent();
            this.second_ui = null;
        }
        this.show_main_list();
    }
    // 点击 个人信息按钮
    on_edit_profile_click() {
        this.second_ui = cc.instantiate(this.edit_prefab);
        this.second_ui.parent = this.node;

        this.hide_main_list("个人信息");
    }

    sync_info() {
        this.unick.string = ugame.unick;
    }

    // 游客绑定升级
    on_guest_upgrade_click() {
        this.second_ui = cc.instantiate(this.guest_upgrade_prefab);
        this.second_ui.parent = this.node;

        this.hide_main_list("游客升级");
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


    // update (dt) {}
}
