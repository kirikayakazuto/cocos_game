import dou_di_zhu from "../protobufs/dou_di_zhu";
import poker_list from "./poker_list"
import QueuePool from "./QueuePool";
import poker_card from "./poker_card";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    qiang_dizhu: cc.Node = null;
    @property(cc.Node)
    send_cards: cc.Node = null;
    @property(cc.Node)
    yaobuqi_node: cc.Node = null;

    @property(poker_list)
    poker_list: poker_list = null;


    onLoad () {
        this.node.active = false;
        // this.qiang_dizhu.active = false;
        // this.send_cards.active = false;

        
    }

    start () {

    }

    show_node() {
        this.node.active = true;
    }
    hide_node() {
        this.node.active = false;
    }
    /**
     * 抢地主
     */
    show_qiang_dizhu_button() {
        this.qiang_dizhu.active = true;
        
        this.send_cards.active = false;
        this.yaobuqi_node.active = false;
    }
    /**
     *  出牌
     */
    show_send_cards_button() {
        this.qiang_dizhu.active = false;
        this.send_cards.active = true;
        this.yaobuqi_node.active = false;
    }
    /**
     * 要不起按钮
     */
    show_yaobuqi_button() {
        this.yaobuqi_node.active = true;
        this.qiang_dizhu.active = false;
        this.send_cards.active = false;

    }

    /**
     * 
     */
    /**
     * 抢地主 点击抢地主1, 不抢地主0
     */
    dizhu_button_click(e,num) {
        num = parseInt(num);
        dou_di_zhu.send_dizhu(num);
    }
    /**
     * 
     */
    send_card_button_click(e, num) {
        num = parseInt(num);
        switch(num) {
            case 0: // 出牌
                // 先到poker list中 获取出牌的牌组
                let arr = this.poker_list.get_selected_poker_card();
                if(arr.length == 0) {
                    return ;
                }
                // 发送到服务器进行校验
                dou_di_zhu.send_poker_cards(arr);
                // 调用poker_di_pool的方法 出牌

            break;
            case 1: // 不出
                dou_di_zhu.send_poker_cards([]);
            break;
            case 2: // 提示 
                // 1 从底池中取出上一次 玩家出的 牌组
                let playerCards = QueuePool.getPrevious();
                // 2 查看手牌中是否有同类型的牌 有
                let arr_poker = this.poker_list.get_all_poker();
                // 3 查看同类型的牌, 是否比上一个玩家的大 没有4

                // 从小到大出牌
                console.log("提示");
                // 4 如果同类型的牌 都没有上一个玩家的大, 判断上一个玩家的是否是炸弹 不是
                // 5 查看手牌是否有炸弹 有
                // 6 从小到大出炸弹
            break;
        }
    }

    /**
     * 获得出牌的提示
     */
    getSendPokerTips () {

    }

    /**
     * 获得手牌中 所有类型的牌
     */
    getPokerCardsAllType(arr_poker: Array<poker_card>) {
        
    }

    // update (dt) {}
}
