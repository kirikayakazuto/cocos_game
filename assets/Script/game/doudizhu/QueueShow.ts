export default class QueueShow {

    static elements: Array<cc.Node> = new Array<cc.Node>();
    static  _size: number = 2;

    /**
     * 添加一个显示
     * @param o 
     */
    static push(o: cc.Node) {
        if (o == null) {
            return false;
        }
        if (this._size != undefined && !isNaN(this._size)) {
            if (this.elements.length == this._size) {
                let node = this.pop();
                for(let i=0; i<node.children.length; i++) {
                    node.children[i].active = false;
                }
                node.active = false;
            }
        }
        if(o.active == false) {
            o.active = true;
        }
        this.elements.unshift(o);
        return true;
    }
    /**
     * 清除所有显示
     */
    static clear() {
        for(let i=0; i<this.elements.length; i++) {
            for(let j=0; j<this.elements[i].children.length; j++) {
                this.elements[i].children[j].active = false;
            }
            this.elements[i].active = false;
        }
        // delete this.elements;
        this.elements = new Array<cc.Node>();
    }


    /**
     * 取出一个元素
     */
    static pop(): cc.Node {
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