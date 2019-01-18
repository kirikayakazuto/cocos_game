import talk_room from "../protobufs/talk_room";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    editbox: cc.EditBox = null;

    @property(cc.Button)
    submit: cc.Button = null;

    @property(cc.Prefab)
    self_item: cc.Prefab = null;

    @property(cc.Prefab)
    other_item: cc.Prefab = null;

    @property(cc.Prefab)
    time_item: cc.Prefab = null;

    @property(cc.Node)
    center_node: cc.Node = null;
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    friend_name = "";

    refresh_flag = false;

    all_item_height = 0;
    // LIFE-CYCLE CALLBACKS:
    
    onLoad () {
        this.node.on("bounce-top", this.drop_down_refresh, this);
    }

    start () {

    }
    init(friend_name: string) {
        this.friend_name = friend_name;
    }
    /**
     * 下拉获取历史聊天信息
     */
    drop_down_refresh() {
        if(this.refresh_flag) {
            return ;
        }
        this.refresh_flag = true;
        this.scheduleOnce(() => {
            this.refresh_flag = false;
        }, 2);
        talk_room.get_history_talk_msg(this.friend_name);
    }
    /**
     * 获取当前聊天面板的人物信息
     */
    get_fname() {
        return this.friend_name;
    }
    /**
     * 清除输入框
     */
    clear_exitbox_input() {
        this.editbox.string = "";
        this.submit.interactable = false;
    }
    show_time_msg(time: string) {
        // 显示头像
        let node = cc.instantiate(this.time_item);
        let str = node.getChildByName("str");
        str.getComponent(cc.Label).string = time;
        node.parent = this.center_node;
        this.scrollView.scrollToBottom(0.1);
    }
    /**
     * 显示自己的聊天内容
     */
    show_self_talk_msg(msg: string) {
        // 显示头像
        let node = cc.instantiate(this.self_item);
        this._show_talk_msg(node, msg);
    }
    /**
     * 显示其他人的聊天内容
     */
    show_other_talk_msg(msg: string) {
        // 显示头像
        let node = cc.instantiate(this.other_item);
        this._show_talk_msg(node, msg);
    }

    _show_talk_msg(node: cc.Node, msg: string) {
        let str = node.getChildByName("box").getChildByName("str").getComponent(cc.Label);
        
        str.overflow =  cc.Label.Overflow.NONE;
        str.string = msg;

        node.parent = this.center_node;
        
        if (str.node.width >= 430) { //maxWidth气泡最大宽度
            str.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            str.node.width = 430;
        }
        node.getChildByName("box").getComponent(cc.Layout).updateLayout();
        let count = str.node.height / 40;
        let h = count * 45;
        node.height = h + 60;

        this.all_item_height += node.height;
        // 72
        if(this.all_item_height > this.center_node.height) {
            this.center_node.height = this.all_item_height;
        }
        
        this.scrollView.scrollToBottom(0.1);
    }
    
    /**
     * 玩家输入
     * @param text 
     * @param editbox 
     * @param data 
     */
    on_text_change(text: string, editbox, data) {
        if(text.trim() == "" || text == null) {
            this.submit.interactable = false;
        }else {
            this.submit.interactable = true;
        }
    }
    /**
     * 点击发送按钮
     */
    submit_button_click() {
        if(this.editbox.string.trim() == "" || this.editbox.string == null) {
            return ;
        }
        console.log(this.editbox.string);
        // 发送好友 name 和 msg
        talk_room.talk_with_friend(this.friend_name, this.editbox.string);
    }

    // update (dt) {}
}
