import player_seat_status from "./player_seat_status"
import QueueShow from "./QueueShow"
import poker_card from "./poker_card";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property([player_seat_status])
    seat_array: Array<player_seat_status> = [];
    // onLoad () {}

    @property([cc.SpriteFrame])
    dizhu_sp_array: Array<cc.SpriteFrame> = []; // 0叫地主1抢地主2不叫3不抢

    start () {

    }
    /**
     * 
     * @param is_who 0 自己 , 1 A, 2 B
     * @param poker_array 打出去的牌数组, length==0 表示不出
     */
    show_player_send_poker(is_who: number, poker_array: Array<poker_card>) {
        if(is_who < 0 || is_who > 2) {
            return ;
        }
        this.seat_array[is_who].show_poker(is_who, poker_array);
        QueueShow.push(this.seat_array[is_who].node);
        
    }    
    /**
     * 游戏结束, 显示每一位玩家的手牌
     * 
     */
    show_player_pokers(is_who: number, poker_array: Array<poker_card>) {
        if(is_who == 0) {
            return ;
        }
        this.seat_array[is_who].show_poker(is_who, poker_array);
        this.seat_array[is_who].node.active = true;
    }
    /**
     * 
     */
    hide_player_pokers() {
        for(let i=0; i<3; i++) {
            for(let j=0; j<this.seat_array[i].node.children.length; j++) {
                this.seat_array[i].node.children[j].active = false;
            }
            this.seat_array[i].node.active = false;
        }
    }
    /**
     * 抢地主 环节
     */
    show_qiang_dizhu(is_who: number, dizhu_array: Array<number>, is_dizhu: number) {
        let dizhu_count = 0;
        let sp_index = -1;
        for(let i=0; i<dizhu_array.length; i++) {
            if(dizhu_array[i][0] == 1) {
                dizhu_count ++;
            }
        }
        if(is_dizhu == 1) {    // // 0叫地主1抢地主2不叫3不抢
            if(dizhu_count == 0) {
                // 叫地主 
                sp_index = 0;
            }else if(dizhu_count >= 1) {
                // 抢地主
                sp_index = 1;
            }
        }else { 
            if(dizhu_count == 0) {
                // 不叫
                sp_index = 2;
            }else {
                // 不抢
                sp_index = 3;
            }
        }
        this.seat_array[is_who].show_dizhu_result(this.dizhu_sp_array[sp_index]);
        QueueShow.push(this.seat_array[is_who].node);
    }
    /**
     * 展示其他玩家的poke
     */
    show_other_player_pokers() {

    }


    /**
     * 清除底池的所有显示
     */
    hide_all_player_show() {
        QueueShow.clear();
    }

    // 每次显示了两个, 在要显示就把前面的取消显示


    // update (dt) {}
}
