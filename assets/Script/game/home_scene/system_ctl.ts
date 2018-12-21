import ugame from "../ugame";
import game_system from "../protobufs/game_system";
import world_rank from "./world_rank"

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    unick: cc.Label = null;
    @property(cc.Node)
    main_list: cc.Node = null;
    @property(cc.Node)
    back: cc.Node = null;
    @property(cc.Prefab)
    world_rank_prefab: cc.Prefab = null;
    @property(cc.Label)
    title_label: cc.Label = null;
    // 二级页面
    second_ui: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.back.active = false;
        this.sync_info();
    }

    sync_info() {
        this.unick.string = ugame.unick;    
    }
    // 获取世界排行榜
    on_get_world_rank_click() {
        if(this.second_ui != null) {
            this.second_ui.removeFromParent();
        }
        this.second_ui = cc.instantiate(this.world_rank_prefab);
        this.second_ui.parent = this.node;

        this.hide_main_list("排行榜");
    }

    on_get_world_rank_data(my_rank_num: number, rank_data: Array<any>) {
        if(this.second_ui != null) {
            let world_rank: world_rank = this.second_ui.getComponent("world_rank");
            world_rank.show_world_rank(my_rank_num, rank_data);
        }
    }

    // 显示主ui
    show_main_list() {
        this.back.active = false;
        this.main_list.active = true;
        this.title_label.string = "系统";
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
