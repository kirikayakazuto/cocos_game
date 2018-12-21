import ugame from "../ugame";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Prefab)
    item: cc.Prefab = null;

    @property(cc.Node)
    content: cc.Node = null;



    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }
    /**
     * name: string, game_type: string, game_time: string, result: boolean, chip: string
     * @param history_arr 
     */
    add_item_to_content(history_arr: Array<game_history>) {
        this.content.removeAllChildren();
        for(let i=history_arr.length-1; i>=0; i--) {
            let node = cc.instantiate(this.item);
            node.getComponent("history_item").init(
                ugame.unick,
                history_arr[i].type,
                history_arr[i].time,
                history_arr[i].result,
                history_arr[i].chip,
                );
            node.parent = this.content;    
        }

        
    }

    quit_button_click() {
        this.node.removeFromParent();
    }

    // update (dt) {}
}


interface game_history {
    id?: number,
    uid?: number,
    uname?: string,
    type?: string,
    time?: string,
    result?: number,
    chip?: number,
}