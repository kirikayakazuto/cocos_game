import poker_card from "./poker_card";
import poker_spirte from "./poker_sprite"
import sort_card from "./sort_cards";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    // LIFE-CYCLE CALLBACKS:
    @property(cc.Node)
    poker_node: cc.Node = null;

    @property(cc.Sprite)
    buchu: cc.Sprite = null;

    @property(cc.Prefab)
    poker_little: cc.Prefab = null;

    @property(cc.Sprite)
    dizhu_flag_sp: cc.Sprite = null;

    

    onLoad () {
        this.poker_node.removeAllChildren();
        this.buchu.node.active = false;
        this.dizhu_flag_sp.node.active = false;
    }

    start () {

    }
    // 第一个115 0
    // 80 0          x 递减 35
    // 最后 -165
    // 下一行 115 -65
    
    show_poker(who: number, array: Array<poker_card>) {
        
        if(array && array.length > 0) {
            this.poker_node.removeAllChildren();
            array.sort(sort_card.gradeDownPoker.bind(sort_card));
            if(who == 2) {
                array.reverse();    // 反序
            }

            if(who == 0) {  // 自己
                for(let i=0; i<array.length; i++) {
                    let node = cc.instantiate(this.poker_little);
                    let arr = poker_spirte.get_poker_spriteframe(array[i]);
                    node.getComponent("poker_little").init(arr[0], arr[1]);
                    node.parent = this.poker_node;
                }
                this.poker_node.active = true;
                return ;
            }
          
            for(let i=0; i<array.length; i++) {
                let node = cc.instantiate(this.poker_little);
                if(who == 1) {  // 1是A
                    node.x = -80 + ((i%8) * 35);
                }else if(who == 2) {    // 2 是B
                    node.x = 80 - ((i%8) * 35);
                    node.zIndex = array.length-i%8;   // 第二排的, 要在第一排上面
                }
                node.y = Math.floor(i/8) * -65 + 0;
                let arr = poker_spirte.get_poker_spriteframe(array[i]);
                node.getComponent("poker_little").init(arr[0], arr[1]);
                node.parent = this.poker_node;
            }
            this.poker_node.active = true;
        }else {
            this.buchu.node.active = true;
        }
    }

    /**
     * 第一个1是叫地主, 后面的1是抢地主
     * 出现一个1或0个一, 后面的0是不叫
     * 
     * 第一个人不叫, 后面两个人争
     */
    show_dizhu_result(sp: cc.SpriteFrame) {
        this.dizhu_flag_sp.spriteFrame = sp;
        this.dizhu_flag_sp.node.active = true;
    }
    /**
     * 
     * let count = 0;
            this.schedule(() => {
                let node = cc.instantiate(this.poker_little);
                node.x = 115 - ((count%9) * 35);
                node.y = Math.floor(count/9) * -65 + 0;
                let arr = poker_spirte.get_poker_spriteframe(array[count]);
                node.getComponent("poker_little").init(arr[0], arr[1]);
                node.parent = this.poker_node;
            }, 0.12, array.length-1);
     */

    // update (dt) {}
}
