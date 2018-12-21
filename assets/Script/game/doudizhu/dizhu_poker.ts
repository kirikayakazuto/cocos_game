import poker_little from "./poker_little"
import poker_sprite from "./poker_sprite"
import poker_card from "./poker_card";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property([poker_little])
    poker_arr: Array<poker_little> = [];
    
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.active = false;
    }

    start () {

    }
    /**
     * 显示地主的3张扑克
     * @param poker_array 
     */

    show_dizhu_poker(poker_array: Array<poker_card>) {
        for(let i=0; i<poker_array.length; i++) {
            let arr = poker_sprite.get_poker_spriteframe(poker_array[i]);
            this.poker_arr[i].init(arr[0], arr[1]);
        }
        this.node.active = true;
    }

    hide_dizhu_poker() {
        this.node.active = false;
    }

    // update (dt) {}
}
