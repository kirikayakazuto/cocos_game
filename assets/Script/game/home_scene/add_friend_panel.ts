import auth from "../protobufs/auth";
import Response from "../Response";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    friend_id: cc.EditBox = null;

    @property(cc.Node)
    friend_item: cc.Node = null;
    @property(cc.Node)
    error_item: cc.Node = null;

    @property([cc.SpriteFrame])
    usex_sp: Array<cc.SpriteFrame> = [];

    @property(cc.Node)
    tishi_panel: cc.Node = null;

    friend_id_str = "";

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.friend_item.active = false;
        this.error_item.active = false;
    }

    start () {

    }
    /**
     * 搜索好友
     */
    find_button_click() {
        this.friend_id_str = "";
        if(this.friend_id.string.trim() == "" || this.friend_id.string == null) {
            return ;
        }
        this.friend_id_str = this.friend_id.string;
        // 寻找好友
        auth.find_friend(this.friend_id_str);
        // 发送通知到服务器
    }
    /**
     * 添加好友
     */
    add_button_click() {
        if(this.friend_id_str == "") {
            return ;
        }
        // 发送通知到服务器
        auth.add_friend(this.friend_id_str);
        // end
    }
    /**
     * 显示朋友的信息
     */
    show_friend_info(friend_info: FriendInfo) {
        if(friend_info == null) {
            this.error_item.active = true;
            this.friend_item.active = false;
            return ;
        }
        this.friend_item.getChildByName("name").getComponent(cc.Label).string = friend_info.unick;;
        this.friend_item.getChildByName("usex").getComponent(cc.Sprite).spriteFrame = this.usex_sp[friend_info.usex];
        this.friend_item.getChildByName("id").getComponent(cc.Label).string = friend_info.uname;
        this.error_item.active = false;
        this.friend_item.active = true;
    }

    show_add_friends_result(status: number) {
        if(status == Response.OK) {
            this.tishi_panel.getChildByName("str").getComponent(cc.Label).string = "已发送添加好友请求!";
        }else if(status == Response.IS_FRIEND){
            this.tishi_panel.getChildByName("str").getComponent(cc.Label).string = "对方已是你的好友!";
        }else if(status == Response.HAS_SEND_ADD_FRIEND){
            this.tishi_panel.getChildByName("str").getComponent(cc.Label).string = "已经发送了添加好友请求!";
        }else {
            this.tishi_panel.getChildByName("str").getComponent(cc.Label).string = "error!";
        }
        this.tishi_panel.active = true;
    }

    close_tishi_panel() {
        this.tishi_panel.active = false;
    }

    // update (dt) {}
}

class FriendInfo {
    uname: string;
    unick: string;
    uface: number = -1;
    usex: number;
}
