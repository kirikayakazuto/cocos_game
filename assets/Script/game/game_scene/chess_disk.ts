import five_chess from "../protobufs/five_chess"
const {ccclass, property} = cc._decorator;

const BLOCK_WIDTH = 41;

@ccclass
export default class NewClass extends cc.Component {

    @property([cc.Prefab])
    chess_prefab: Array<cc.Prefab> = [];
    

    your_turn: boolean = false;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.your_turn = false;
        this.node.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) => {

            let w_pos = e.getLocation();
            let pos = this.node.convertToNodeSpaceAR(w_pos);

            pos.x += BLOCK_WIDTH * 7;
            pos.y += BLOCK_WIDTH * 7;

            let block_x = Math.floor((pos.x + BLOCK_WIDTH * 0.5) / BLOCK_WIDTH);
            let block_y = Math.floor((pos.y + BLOCK_WIDTH * 0.5) / BLOCK_WIDTH);

            
            if(block_x < 0 || block_x > 14 || block_y < 0 || block_y > 14) {
                return ;
            }
            
            
            five_chess.send_put_chess(block_x, block_y);
        });
    }

    put_chess_at(chess_type: number, block_x: number, block_y: number) {
        let chess = cc.instantiate(this.chess_prefab[chess_type - 1]);
        chess.parent = this.node;

        let pos_x = block_x * BLOCK_WIDTH - BLOCK_WIDTH * 7;
        let pos_y = block_y * BLOCK_WIDTH - BLOCK_WIDTH * 7;

        chess.setPosition(cc.p(pos_x, pos_y));
    }

    set_your_turn(your_turn: boolean) {
        this.your_turn = your_turn;
    }

    clear_disk() {
        this.node.removeAllChildren();
    }

    start () {

    }

    // update (dt) {}
}
