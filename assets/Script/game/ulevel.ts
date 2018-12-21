export default class ulevel {

    // 上一级到本级所需要的经验;
    static level_exp: Array<number> = [0, 1500, 2000, 2000, 3000, 3000, 4000, 4000, 5000, 5000, 8000, 8000, 8000, 9000, 9000, 9000];

    // 等级, 百分比
    static get_level(exp: number) { // 经验值
        let ret = [0, 0];

        let last_exp = exp;
        let level = 0;

        for(let i = 1; i < this.level_exp.length; i ++) {
            if (last_exp < this.level_exp[i]) {
                ret[0] = level;
                ret[1] = last_exp / this.level_exp[i];
                return ret;
            }
            last_exp -= this.level_exp[i];
            level = i;
        }
        
        ret[0] = level;
        ret[1] = 1;

        return ret;
        
    }
}

