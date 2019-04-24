
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    // onLoad () {}

    start () {

    }
    /**
     * 在线匹配
     */
    online_game_click() {
        console.log("online game");
    }
    /**
     * 创建房间
     */
    create_room_click() {
        console.log("create room");
    }
    /**
     * 加入房间
     */
    join_room_click() {
        console.log("join room");
    }

    
    /**
     * 设置按钮
     */
    setting_button_click() {
        console.log("setting");
    }
    /**
     * 返回按钮
     */
    back_button_click() {
        console.log("back");
    }

    // update (dt) {}
}
