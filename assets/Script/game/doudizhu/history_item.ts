
const {ccclass, property} = cc._decorator;
/**
 * 控制历史记录中的item
 */
@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    uname: cc.Label = null;
    @property(cc.Label)
    game_type: cc.Label = null;
    @property(cc.Label)
    game_time: cc.Label = null;
    @property(cc.Label)
    result: cc.Label = null;
    @property(cc.Label)
    chip: cc.Label = null;


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }
    /**
     * 初始化item
     * @param name 
     * @param game_type 
     * @param game_time 
     * @param result 
     * @param chip 
     */
    init(name: string, game_type: string, game_time: string, result: boolean, chip: string) {
        this.uname.string = name;
        this.game_type.string = "经典:经典玩法";
        this.game_time.string = game_time;
        if(result) {
            this.result.node.color = new cc.Color(78, 54, 255, 255);
            this.chip.node.color = new cc.Color(78, 54, 255, 255);
            this.result.string = "胜利";
            this.chip.string = "金币:+" +chip;
        }else {
            this.result.node.color = new cc.Color(255, 49, 49, 255);
            this.chip.node.color = new cc.Color(255, 49, 49, 255);
            this.result.string = "失败";
            this.chip.string = "金币:-" +chip;
        }
    }

    // update (dt) {}
}
