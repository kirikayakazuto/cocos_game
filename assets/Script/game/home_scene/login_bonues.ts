import game_system from "../protobufs/game_system";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property([cc.Label])
    chip_label: Array<cc.Label> = [];
    @property([cc.Node])
    zw_icon: Array<cc.Node> = [];

    bonues_info: Array<string> = null;
    // 登录奖励信息
    bonues_id: number = null;
    

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.bonues_info = ["100", "200", "300", "400", "500"];
        for(let i=0; i<this.bonues_info.length; i++) {
            this.chip_label[i].string = this.bonues_info[i];
            this.chip_label[i].node.color = new cc.Color(0, 0, 0, 255);

            this.zw_icon[i].active = true;
        }
        // this.node.active = false;
    }

    start () {

    }

    show_login_bonues(id: number, bonues: number, days: number) {
        // 可能会出现 bonues 和 days是0的情况
        if(this.node.active == false) {
            this.node.active = true;
        }
        this.bonues_id = id;

        let i = 0;
        if(days >= this.bonues_info.length) {
            days = this.bonues_info.length;
        }

        for(i=0; i<days; i++) {
            this.chip_label[i].node.color = new cc.Color(255, 0, 0, 255);
            this.zw_icon[i].active = true;
        }

        for(; i<this.bonues_info.length; i++) {
            this.chip_label[i].node.color = new cc.Color(0, 0, 0, 255);
            this.zw_icon[i].active = false;
        }

        this.zw_icon[days - 1].active = true;
        
    }

    on_close_click() {
        this.node.removeFromParent();
    }

    on_recv_cmd_click() {
        game_system.send_recv_login_bonues(this.bonues_id);
        this.node.removeFromParent();
    }

    // update (dt) {}
}
