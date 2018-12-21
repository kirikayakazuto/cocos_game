
const {ccclass, property} = cc._decorator;

@ccclass
export default class frame_anim extends cc.Component {
    
    @property([cc.SpriteFrame])
    sprite_frames: Array<cc.SpriteFrame> = [];
    @property(Number)
    duration = 0.1;  // 播放的 帧间隔
    @property(Boolean)
    loop = false;    // 是否循环播放
    @property(Boolean)
    play_onload =  false; // 加载完毕就开始播放


    sprite: cc.Sprite = null;
    is_playing: boolean = false;
    play_time: number = 0;
    is_loop: boolean = false;
    end_func: () => any = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let s_com = this.node.getComponent(cc.Sprite);
        if(!s_com) {
            s_com = this.node.addComponent(cc.Sprite);
        }

        this.sprite = s_com;

        this.is_playing = false;
        this.play_time = 0;
        this.is_loop = false;
        this.end_func = null;

        if(this.sprite_frames.length > 0) {
            this.sprite.spriteFrame  = this.sprite_frames[0];
        }

        if(this.play_onload) {
            if(!this.loop) {
                this.play_once(null);
            }else {
                this.play_loop();
            }
        }
        
    }
    // 播放一次
    play_once(end_func: () => any) {
        this.play_time = 0;
        this.is_playing = true;
        this.is_loop = false;
        this.end_func = end_func;
    }
    // 循环播放
    play_loop() {
        this.play_time = 0;
        this.is_playing = true;
        this.is_loop = true;
    }
    // 停止播放 
    stop_anim() {
        this.play_time = 0;
        this.is_playing = false;
        this.is_loop = false;
    }

    start () {

    }

    update (dt) {
        if(this.is_playing == false) {  // 没有开始播放
            return ;
        }

        this.play_time += dt;

        let index = Math.floor(this.play_time / this.duration);

        if(this.is_loop == false) {
                if(index >= this.sprite_frames.length) {
                    this.sprite.spriteFrame = this.sprite_frames[this.sprite_frames.length - 1];

                    this.is_playing = false;
                    this.play_time = 0;
                    if(this.end_func) {
                        this.end_func();
                    }
                    return ;
                }else {
                    this.sprite.spriteFrame = this.sprite_frames[index];
                }
        }else {
            while(index >= this.sprite_frames.length) {
                index -= this.sprite_frames.length;
                this.play_time -= (this.duration * this.sprite_frames.length)
            }
            this.sprite.spriteFrame = this.sprite_frames[index];
        }
    }
}
