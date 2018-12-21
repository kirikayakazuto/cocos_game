import dou_di_zhu from "../protobufs/dou_di_zhu";
import ugame from "../ugame";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    left_list: cc.Node = null;

    @property([cc.SpriteFrame])
    clickedSpriteArray: Array<cc.SpriteFrame> = [];

    @property([cc.SpriteFrame])
    noclickedSpriteArray: Array<cc.SpriteFrame> = [];

    // onLoad () {}
    public leftNodeList: Array<cc.Node> = [];
    onLoad() {
        this.leftNodeList = this.left_list.children;
    }
    start () {
        this.show_click_change(0);
    }

    leftNode_button_click(event: any, index) {
        index = parseInt(index);
        this.show_click_change(index);
    }

    /**
     * 
     * @param index 
     */
    show_click_change(index: number) {
        for(let i=0; i<this.leftNodeList.length; i++) {
            if(i == index) {
                this.leftNodeList[i].getComponent(cc.Sprite).spriteFrame = this.clickedSpriteArray[i];
            }else {
                this.leftNodeList[i].getComponent(cc.Sprite).spriteFrame = this.noclickedSpriteArray[i];
            }
        }
    }
    /**
     * 创建房间
     */
    create_room() {
        dou_di_zhu.create_room(1);
    }

    /**
     *  关闭面板
     */
    quit_button_click() {
        this.node.removeFromParent();
    }

    // update (dt) {}
}
