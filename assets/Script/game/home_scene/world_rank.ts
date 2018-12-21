import game_system from "../protobufs/game_system";
import rank_item from "./rank_item"
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    not_in_rank: cc.Node = null;
    @property(cc.Label)
    my_rank_label: cc.Label = null;
    @property(cc.Prefab)
    rank_item_prefab: cc.Prefab = null;
    @property(cc.Node)
    content: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        game_system.get_world_rank_info();
    }
    // 显示排行榜
    show_world_rank(my_rank_num: number, rank_data: Array<any>) {
        for(let i=0; i<rank_data.length; i++) {
            let data = rank_data[i];
            let item = cc.instantiate(this.rank_item_prefab);
            item.parent = this.content;

            let rank_item: rank_item = item.getComponent("rank_item");
            rank_item.show_rank_info(i+1, data[0], data[1], data[2], data[3]);
        }

        if(my_rank_num <= 0) {
            this.not_in_rank.active = true;
            this.my_rank_label.node.active = false;
        }else {
            this.not_in_rank.active = false;
            this.my_rank_label.node.active = true;
            this.my_rank_label.string = "" + my_rank_num;
        }
    }

    // update (dt) {}
}
