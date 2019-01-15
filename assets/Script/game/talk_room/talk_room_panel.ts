
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    editbox: cc.EditBox = null;

    @property(cc.Button)
    submit: cc.Button = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

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
    }

    // update (dt) {}
}
