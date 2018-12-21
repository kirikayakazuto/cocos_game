import poker_card from "./poker_card";

export default class poker_sprite {
    static atlasArray: cc.SpriteAtlas = null;
    static init(ret_func?: any, progressCallback?: (completedCount, totalCount, item) => any) {
        cc.loader.loadRes("doudizhu/ui/poker_b", cc.SpriteAtlas, progressCallback, function (err, atlas: cc.SpriteAtlas) {
            cc.loader["onProgress"]= null;
            if(err) {
                console.log(err);
            }
            this.atlasArray = atlas;
            if(ret_func) {
                ret_func();
            }
        }.bind(this));
    }

    /**
     * 获得poker的花色
     * @param poker 
     * 0 是num 1是type
     */
    static get_poker_spriteframe(poker: poker_card) {
        let sp_num: cc.SpriteFrame = null;
        let sp_type: cc.SpriteFrame = null;
        if(poker.type == -1) {   // 大小王
            if(poker.num == 13) {    //大王
                sp_num = this.atlasArray.getSpriteFrame("b-smalltag_5")
            }else { // 小王
                sp_num = this.atlasArray.getSpriteFrame("b-smalltag_4")
            }
        }else {
            let sp_type_str = "b-bigtag_" + poker.type;
            let sp_num_str = "";
            if(poker.type == 0 || poker.type == 2) {
                sp_num_str = "b-red_" + poker.num;
            }else {
                sp_num_str = "b-black_" + poker.num;
            }

            sp_type = this.atlasArray.getSpriteFrame(sp_type_str);
            sp_num = this.atlasArray.getSpriteFrame(sp_num_str);
        }
        return [sp_num, sp_type];
    }

    static get_poker_bg(bg_name: string) {
        return this.atlasArray.getSpriteFrame(bg_name);
    }
}



