import dou_di_zhu from "../protobufs/dou_di_zhu";
import ugame from "../ugame";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    
    @property(cc.Node)
    num_list: cc.Node = null;
    @property(cc.Node)
    input_list: cc.Node = null;


    input_num_list:Array<String> = [];
    str_lable_list:Array<cc.Node> = [];


    onLoad () {
        this.str_lable_list = this.input_list.children
    }

    start () {

    }

    num_button_click(e, data) {
        if(this.input_num_list.length < 6) {
            this.input_num_list.push(data);
            this.show_click_num();
            if(this.input_num_list.length == 6) {
                
                let room_id = -1;
                let room_str = this.input_num_list.join('');
                room_id = parseInt(room_str);
                console.log("正在查找房间 " + room_id);
                dou_di_zhu.search_room(room_id);
            }
        }
    }

    show_click_num() {
        let i=0;
        for(; i<this.input_num_list.length; i++) {
            this.str_lable_list[i].getComponent(cc.Label).string = this.input_num_list[i] + "";
        }
        for(; i<6; i++) {
            this.str_lable_list[i].getComponent(cc.Label).string = "";
        }
        
    }

    qingchu_button_click() {
        console.log("清除");
        this.input_num_list.splice(0, this.input_num_list.length);
        this.show_click_num();
    }
    houtui_button_click() {
        console.log("后退");
        this.input_num_list.pop();
        this.show_click_num();

    }

    /**
     * 关闭面板
     */
    quit_button_click() {
        this.node.removeFromParent();
    }

    // update (dt) {}
}
