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
