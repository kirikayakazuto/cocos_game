
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(Number)
    total_time: number = 10;

    is_running = false; // 是否正在跑时间
    sprite: cc.Sprite = null;
    now_time = 0;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.is_running = false;
        this.sprite = this.getComponent(cc.Sprite);
    }

    start_action_time(time: number) {
        this.total_time = time;
        this.is_running = true;
        this.now_time = 0;
        this.node.active = true;
    }

    start () {

    }

    update (dt) {
        if(this.is_running == false) {
            return ;
        }

        this.now_time += dt;
        let per = this.now_time / this.total_time;
        if(per > 1) {
            per = 1;
        }

        this.sprite.fillRange = per;

        if(this.now_time >= this.total_time) {
            this.is_running = false;
            this.node.active = false;
        }
    }
}
