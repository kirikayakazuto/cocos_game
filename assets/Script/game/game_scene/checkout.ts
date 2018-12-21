
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    result: cc.Label = null;

    @property(cc.Label)
    score: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        
    }

    show_checkout_result(ret: number, score: number) {
        this.node.active = true;
        if(ret == 2) {
            this.result.string = "平局";
            this.score.string = "本次得分 0 !!!"
        }else if(ret == 1) {
            this.result.string = "胜利!"
            this.score.string = "本次赢了 " + score + " 分!";
        }else if(ret == 0){
            this.result.string = "失败!"
            this.score.string = "本次输了 " + score + " 分!";
        }

    }

    hide_checkout_result() {
        this.node.active = false;
    }

    // update (dt) {}
}
