
import poker_card from "./poker_card";
import sort_card from "./sort_cards";
import poker_sprite from "./poker_sprite"
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    poker_prefab: cc.Prefab  = null;
    atlasArray: cc.SpriteAtlas = null;

    pokerNodeArray: Array<cc.Node> = [];

    public sort_flag = -1;
    sort_speed = 150;

    poker_count = 0;

    _touchBegan = null;
    _touchMoved = null;
    
    

    



    onLoad () {
        this.node.removeAllChildren();    
        // this.pokerNodeArray = this.node.children;
        
        
    }

    start () {
        
    }
    /**
     * 获得被选中的手牌
     */
    get_selected_poker_card() {
        let selected_pokers: Array<poker_card> = [];
        for(let i=0; i<this.pokerNodeArray.length; i++) {
            if(this.pokerNodeArray[i]["status"] == 1) {
                let num = this.pokerNodeArray[i]["num"];
                let type = this.pokerNodeArray[i]["type"];
                selected_pokers.push(new poker_card(num, type));
            }
        }
        return selected_pokers;
    }
    /**
     *
     */
    remove_all_poker() {
        this.pokerNodeArray = [];
        this.node.removeAllChildren();
    }
    /**
     * 删除手牌
     * @param pokers_array 
     */
    remove_selected_poker_card(pokers_array: Array<poker_card>) {
        for(let k=0; k<pokers_array.length; k++) {
            for(let i=0; i<this.pokerNodeArray.length; i++) {
                if(this.pokerNodeArray[i]["num"] == pokers_array[k].num 
                    && this.pokerNodeArray[i]["type"] == pokers_array[k].type ) {
                        this.pokerNodeArray[i].removeFromParent();
                        this.pokerNodeArray.splice(i, 1);
                        break;
                }
            }
        }
        
    }
    // 扑克的花色
    
    /**
     * 发牌,做一个依次收到牌的效果
     */
    send_cards(pokerData: Array<poker_card>) {
        this.node.removeAllChildren();
        let sp_bg = poker_sprite.get_poker_bg("b-bg2");
        for(let i=0; i<pokerData.length; i++) {
            let node = cc.instantiate(this.poker_prefab);
            
            node["num"] = pokerData[i].num;
            node["type"] = pokerData[i].type;
            node["status"] = 0;
            node["isChiose"] = false;

            let arr = poker_sprite.get_poker_spriteframe(pokerData[i]);
            let sp_num: cc.SpriteFrame = arr[0];
            let sp_type: cc.SpriteFrame = arr[1];
            node.getComponent("poker").init(sp_bg, sp_num, sp_type);

            // 装着所有的扑克
            this.pokerNodeArray.push(node);
        }

        let count = 0;
        this.schedule(() => {
            this.pokerNodeArray[count].parent  = this.node;
            // this.node.getComponent(cc.Layout).updateLayout();
            if(count == pokerData.length -1) {
                this.sort_flag = 1;
            }
            count ++;
        }, 0.15, pokerData.length-1);
    }

    get_all_poker() {
        let all_pokers: Array<poker_card> = [];
        for(let i=0; i<this.pokerNodeArray.length; i++) {
            let num = this.pokerNodeArray[i]["num"];
            let type = this.pokerNodeArray[i]["type"];
            all_pokers.push(new poker_card(num, type));
        }
        return all_pokers;
    }
    /**
     * 添加地主的三张牌
     */
    add_cards(pokerData: Array<poker_card>) {
        let dizhu_array: Array<cc.Node> = [];
        let sp_bg = poker_sprite.get_poker_bg("b-bg2");
        for(let i=0; i<pokerData.length; i++) {
            let node = cc.instantiate(this.poker_prefab);
            
            node["num"] = pokerData[i].num;
            node["type"] = pokerData[i].type;

            node["status"] = 0;
            node["isChiose"] = false;

            
            let arr = poker_sprite.get_poker_spriteframe(pokerData[i]);
            let sp_num: cc.SpriteFrame = arr[0];
            let sp_type: cc.SpriteFrame = arr[1];
            node.getComponent("poker").init(sp_bg, sp_num, sp_type);
            node.y = 50;
            node.parent = this.node;
            // 有序的插入
            // ...
            // test
            this.pokerNodeArray.push(node);
            dizhu_array.push(node);
            // end
        }
        this.sort_card();
        this.scheduleOnce(() => {
            let call_back = cc.callFunc(() => {
                this.poker_can_touch(true);
            });
            dizhu_array[0].runAction(cc.moveTo(0.3, dizhu_array[0].x, 0));
            dizhu_array[1].runAction(cc.moveTo(0.3, dizhu_array[1].x, 0));
            dizhu_array[2].runAction(cc.sequence(cc.moveTo(0.3, dizhu_array[2].x, 0), call_back));
        }, 1)
        
    }
    /**
     * 对牌进行排序 从大到小
     * 大王 小王 2 A K Q J 10 9 8 7 6 5 4 3
     */
    sort_card() {
        // 缩小
        this.pokerNodeArray.sort(sort_card.gradeDoun.bind(sort_card));
        for(let i=0; i<this.pokerNodeArray.length; i++) {
            this.pokerNodeArray[i].zIndex = i+1;
        }
        // 放大
    }
    /**
     * 扑克是否可以触摸
     * @param can_touch 
     */
    poker_can_touch(can_touch: boolean) {
        if(can_touch) {
            this.onTouchEvent();
        }else {
            this.offTouchEvent();
        }
        
    }

    update (dt) {
        if(this.sort_flag == 1) {
            this.node.getComponent(cc.Layout).spacingX -= dt*this.sort_speed;
            this.node.getComponent(cc.Layout).updateLayout();
            if(this.node.getComponent(cc.Layout).spacingX <= -140) {
                this.sort_card();
                this.sort_flag = 0;
            }
            
        }else if(this.sort_flag == 0){
            this.node.getComponent(cc.Layout).spacingX += dt*this.sort_speed;
            this.node.getComponent(cc.Layout).updateLayout();
            if(this.node.getComponent(cc.Layout).spacingX >= -100) {
                this.poker_can_touch(true);
                this.sort_flag = -1;
                
            }
        }
    }

    /**
     * 添加触摸监听事件
     */
    onTouchEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchBegan, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMoved, this);
    }

    offTouchEvent() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.touchBegan, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.touchMoved, this);
    }

    touchBegan(event: cc.Event.EventTouch) {
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        this._touchBegan = this.node.convertToNodeSpaceAR(touchLoc);
        this._getCardForTouch(this._touchBegan, this.pokerNodeArray);
    }

    touchMoved(event: cc.Event.EventTouch) {
        
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        this._touchMoved = this.node.convertToNodeSpaceAR(touchLoc);
        this._getCardForTouch(this._touchMoved, this.pokerNodeArray);
        this._checkSelectCardReserve(this._touchBegan, this._touchMoved);
    }

    touchCancel(event: cc.Event.EventTouch) {

    }

    touchEnd(event: cc.Event.EventTouch) {
        
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        this._click_poker();
    }

    // 实现点击效果
    _click_poker() {
        for (let k=0; k<this.pokerNodeArray.length; k++) {
            this.pokerNodeArray[k].getComponent("poker").setMaskShowing(false);
            if (this.pokerNodeArray[k]["isChiose"] === true) {
                this.pokerNodeArray[k]["isChiose"] = false;
                // to 2
                if (this.pokerNodeArray[k]["status"] === 0) {
                    this.pokerNodeArray[k]["status"] = 1;
                    this.pokerNodeArray[k].y += 25;
                } else {
                    this.pokerNodeArray[k]["status"] = 0;
                    this.pokerNodeArray[k].y -= 25;
                }
            }
        }
    }
    /**
     * Touch begin
     * 当前触摸的点 是否在牌的区域
     * */
    _getCardForTouch(touch, cardArr: Array<cc.Node>) {
        
        cardArr.reverse();      //to 1
        for (let k=0; k<cardArr.length; k++) {
            var box = cardArr[k].getBoundingBox();   //获取card覆盖坐标范围
            if (cc.rectContainsPoint(box, touch)) {      //判断触摸的点，是否在当前牌的范围内
                cardArr[k]["isChiose"] = true;
                cardArr[k].getComponent("poker").setMaskShowing(true);  //显示阴影遮罩
                cardArr.reverse();
                return cardArr[k];
            }
        }
        cardArr.reverse();
    }

    /**
     * Touch move
     *
     * */
    _checkSelectCardReserve(touchBegan, touchMoved) {
        //获取左边的点 为起始点
        var p1 = touchBegan.x < touchMoved.x ? touchBegan : touchMoved;
        //滑动的宽度
        var width = Math.abs(touchBegan.x - touchMoved.x);
        //滑动的高度 最小设置为5
        var height = Math.abs(touchBegan.y - touchMoved.y) > 5 ? Math.abs(touchBegan.y - touchMoved.y) : 5;
        //根据滑动 获取矩形框
        var rect = cc.rect(p1.x, p1.y, width, height);

        for (let i = 0; i < this.pokerNodeArray.length; i++) {
            //判断矩形是否相交
            if (!cc.rectIntersectsRect(this.pokerNodeArray[i].getBoundingBox(), rect)) {
                //不相交 设置为反选状态
                this.pokerNodeArray["isChiose"] = false;
                this.pokerNodeArray[i].getComponent("poker").setMaskShowing(false);
            }
        }

        //如果是从右向左滑动
        if (p1 === touchMoved) {
            for (let i = this.pokerNodeArray.length - 1; i >= 0; i--) {
                //从右往左滑时，滑到一定距离，又往右滑
                //这是要判断反选
                if (this.pokerNodeArray[i].x - p1.x < 24) {  //
                    this.pokerNodeArray[i].getComponent("poker").setMaskShowing(false);
                    this.pokerNodeArray[i]["isChiose"] = false;
                }
            }
        }

    }
}

enum PukerType {
    redSquare = 0,  //方块
    blackFlower = 1,   // 梅花
    redPeach = 2,   // 红桃
    blakePeach = 3, // 黑桃
}
