import playerPoker from "./playerPoker";

export default class QueuePool {

    static elements: Array<playerPoker> = new Array<playerPoker>();
    static  _size: number = 2;

    static NONE_CARDS = 0;

    /**
     * 获得上一个牌组
     */
    static getPrevious() {
        for(let i=0; i<this.elements.length; i++) {
            if(this.elements[i].type != 0) {    // 0表示该玩家没出
                return this.elements[i];    // 当前玩家必须出一个 大于 此牌组的牌组
            }
        }
        return new playerPoker([], 0);    // 表示底池为空, 开启一个新的回合
    }

    /**
     * 添加一个显示
     * @param o 
     */
    static push(o: playerPoker) {
        if (o == null) {
            return false;
        }
        if (this._size != undefined && !isNaN(this._size)) {
            if (this.elements.length == this._size) {
                this.pop();
            }
        }
        
        this.elements.unshift(o);
        return true;
    }
    /**
     * 清除所有显示
     */
    static clear() {
        delete this.elements;
        this.elements = new Array<playerPoker>();
    }


    /**
     * 取出一个元素
     */
    static pop(): playerPoker {
        return this.elements.pop();
    }
    /**
     * 当前数组的大小
     */
    static size(): number {
        return this.elements.length;
    }
    /**
     * 判断是否为空
     */
    static isEmpty(): boolean {
        return this.size() == 0;
    }
    
}


