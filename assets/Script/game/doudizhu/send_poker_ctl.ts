import playerPoker from "./playerPoker";

export default class send_poker_ctl {
    // 14种类型
    static ERROR_CARDS = -1 // 错误牌型
    static NONE_CARD = 0;   // 不出
    static SINGLE_CARD = 1 // 单牌  
    static DOUBLE_CARD = 2 //对子  
    static THREE_CARD = 3 //3不带  
    static THREE_ONE_CARD = 4 //3带1  
    static THREE_TWO_CARD = 5 //3带2  
    static BOMB_TWO_CARD = 6 //四个带2张单牌  
    static BOMB_FOUR_CARD = 7 //四个带2对  
    static CONNECT_CARD = 8 //连牌  
    static COMPANY_CARD = 9 //连队  
    static AIRCRAFT_CARD = 10 //飞机不带  
    static AIRCRAFT_ONE_WING = 11 //飞机带单牌
    static AIRCRAFT_TWO_WING = 12 //飞机带对子
    static BOMB_CARD = 13 //炸弹  
    static KINGBOMB_CARD = 14 //王炸

    /**
     * 判断扑克数组是什么类型的
     * A~K 0~12, 大王13 小王14
     * @param poker_cards 
     */
    static getCardsArrayType(cards_array: Array<poker>) {
        // 1 判断有几张牌
        let len = cards_array.length;
        let poker_type = -2;

        cards_array.sort(sort_card.gradeUp.bind(sort_card));
        let arr = this._transformation_arr(cards_array);
        
        switch(len) {
            case 0:
                poker_type = send_poker_ctl.NONE_CARD;          // 不出
            break;
            case 1:
                poker_type = send_poker_ctl.SINGLE_CARD;        // 单张
            break;
            case 2:
                if(this.isDoubleCard(arr)) {            // 判断是不是对子
                    poker_type = send_poker_ctl.DOUBLE_CARD;
                }else if(this.isKingBombCard(arr)) {    // 判断是不是王炸
                    poker_type = send_poker_ctl.KINGBOMB_CARD;
                }else {
                    poker_type = send_poker_ctl.ERROR_CARDS;
                }
            break;
            case 3:
                if(this.isThreeCard(arr)) {             // 判断是不是三张不带
                    poker_type = send_poker_ctl.THREE_CARD
                }else {
                    poker_type = send_poker_ctl.ERROR_CARDS;
                }
            break;
            case 4:
                if(this.isBombCard(arr)) {
                    poker_type = send_poker_ctl.BOMB_CARD;
                }else if(this.isThreeOneCard(arr)) {
                    poker_type = send_poker_ctl.THREE_ONE_CARD;
                }else {
                    poker_type = send_poker_ctl.ERROR_CARDS;
                }
            break;
            case 5:
                if(this.isThreeTwoCard(arr)) {
                    poker_type = send_poker_ctl.THREE_TWO_CARD;
                }else if(this.isConnectCard(arr)){
                    poker_type = send_poker_ctl.CONNECT_CARD;
                }else {
                    poker_type = send_poker_ctl.ERROR_CARDS;
                }
            break;
            case 6:
                if(this.isBombTwo(arr)) {
                    poker_type = send_poker_ctl.BOMB_TWO_CARD;
                }else if(this.isCompanyCard(arr)) {
                    poker_type = send_poker_ctl.COMPANY_CARD;
                }else if(this.isAircraft(arr)) {
                    poker_type = send_poker_ctl.AIRCRAFT_CARD;
                }
            break;
            case 8:
                if(this.isBombTwo(arr)) {
                    poker_type = send_poker_ctl.BOMB_FOUR_CARD;
                }
            break;
        }
        // 在switch中 没有对应的选择
        // 7 9 10 11 12 13...
        if(poker_type == -2 && cards_array.length <= 20) {  
            if(this.isConnectCard(arr)){    // 单顺     5 ~ 12
                poker_type = send_poker_ctl.CONNECT_CARD;
            }else 
            if(this.isCompanyCard(arr)) {   // 双顺    6 8 10 12 .. 24
                poker_type = send_poker_ctl.COMPANY_CARD;
            }else 
            if(this.isAircraft(arr)) {      // 飞机不带 6 9 12 15 18                     // 飞机
                poker_type = send_poker_ctl.AIRCRAFT_CARD;
            }else 
            if(this.isAircraftWing(arr)){   // 飞机 带
                if(cards_array.length % 4 == 0) {
                    poker_type = send_poker_ctl.AIRCRAFT_ONE_WING;
                }else {
                    poker_type = send_poker_ctl.AIRCRAFT_TWO_WING;
                }
            }
        }

        return poker_type;
    }
    /**
     * 判断是不是对子
     */
    static isDoubleCard(poker_cards: Array<number>) {
        return poker_cards[0] == poker_cards[1];
    }
    /**
     * 判断是不是王炸
     */
    static isKingBombCard(poker_cards: Array<number>) {
        if((poker_cards[0] == 14 || poker_cards[0] == 15)
            && (poker_cards[1] == 14 || poker_cards[1] == 15)) {
                return true;
        }
        return false;
    }
    /**
     * 判断是不是三张不带
     */
    static isThreeCard(poker_cards: Array<number>) {
        return poker_cards[0] == poker_cards[1] 
        && poker_cards[0] == poker_cards[2];
    }
    /**
     * 判断是不是普通炸弹
     */
    static isBombCard(poker_cards: Array<number>) {
        return poker_cards[0] == poker_cards[1]
            && poker_cards[0] == poker_cards[2]
            && poker_cards[0] == poker_cards[3];
    }
    /**
     * 判断是不是3带1
     */
    static isThreeOneCard(poker_cards: Array<number>) {
        let threeArr = [];
        
        if(poker_cards[0] == poker_cards[1]) {
            for(let i=0; i<3; i++) {
                threeArr.push(poker_cards[i]);
            }
        }else {
            for(let i=1; i<4; i++) {
                threeArr.push(poker_cards[i]);
            }
        }
        return this.isThreeCard(threeArr);
    }
    /**
     * 3带2
     */
    static isThreeTwoCard(poker_cards: Array<number>) {
        if(poker_cards[0] == poker_cards[1]
        && poker_cards[3] == poker_cards[4]) {
            if(poker_cards[1] == poker_cards[2]
            || poker_cards[2] == poker_cards[3]) {
                return true;
            }
        }
        return false;
    }
    /**
     * 单顺
     * len > 5
     * @param poker_cards 
     * CONNECT_CARD
     */
    static isConnectCard(poker_cards: Array<number>) {
        if(poker_cards.length < 5){
            return false;
        }
        if(poker_cards[poker_cards.length-1] > 12) {
            return false;
        }
        for(let i=0; i<poker_cards.length-1; i++) {
            if((poker_cards[i] + 1) != poker_cards[i+1]) {
                return false;
            }
        }

        return true;
    }
    /**
     * 双顺, 连对
     * len >= 6
     */
    static isCompanyCard(poker_cards: Array<number>) {
        if(poker_cards.length < 6 || poker_cards.length % 2 != 0) {
            return false;
        }

        if(poker_cards[poker_cards.length-1] > 12) {
            return false;
        }

        for(let i=0; i<poker_cards.length-1; i++) {
            if(i % 2 == 0) {
                if(poker_cards[i] != poker_cards[i+1]) {
                    return false;
                }
            }else {
                if((poker_cards[i]+1) != poker_cards[i+1]) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * 飞机 不带
     * len >= 6
     */
    static isAircraft(poker_cards: Array<number>) {
        if(poker_cards.length < 6 || poker_cards.length % 3 != 0) {
            return false;
        }

        if(poker_cards[poker_cards.length-1] > 12) {
            return false;
        }

        for(let i=0; i<poker_cards.length-1; i++) {
            if(i % 3 == 0) {
                if(poker_cards[i] != poker_cards[i+1] ||
                    poker_cards[i] != poker_cards[i+2]) {
                    return false;
                }
            }else if(i % 3 == 2){
                if((poker_cards[i] + 1) != poker_cards[i+1]) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * 4带2 (2个单张 或 2个对子)
     * 6张 或 8张
     */
    static isBombTwo(poker_cards: Array<number>) {
        if(poker_cards.length != 6 && poker_cards.length != 8) {
            return ;
        }

        let bomb_arr: Array<number> = [];
        let other_arr: Array<number> = [];
        let pos = 0;
        let count = 0;

        for(let i=0; i<poker_cards.length-3; i++) {
            if(poker_cards[i] == poker_cards[i+1] &&
            poker_cards[i] == poker_cards[i+2] &&
            poker_cards[i+2] == poker_cards[i+3]) {
                bomb_arr.push(poker_cards[i]);
                bomb_arr.push(poker_cards[i+1]);
                bomb_arr.push(poker_cards[i+2]);
                bomb_arr.push(poker_cards[i+3]);
                pos = i;
                count ++;
                break;
            }
        }
        if(count != 1) {
            return false;
        }
        let i=0;
        for(i=0; i<pos; i++) {
            other_arr.push(poker_cards[i]);
        }
        for(i=i+4; i<poker_cards.length; i++) {
            other_arr.push(poker_cards[i]);
        }

        if(other_arr.length == 2) {
            return true;
        }else if(other_arr.length == 4) {   // 判断是不是两队
            if(other_arr[0] == other_arr[1] &&
            other_arr[2] == other_arr[3]) {
                return true;
            }
        }
        return false;
    }
    /**
     * 飞机带翅膀 4*2 = 8  5*2=10 
     * @param poker_cards 
     */
    static isAircraftWing(poker_cards: Array<number>) {
        if(poker_cards.length < 8) {
            return false;
        }
        if(poker_cards.length % 4 != 0 && poker_cards.length % 5 != 0) {
            return false;
        }

        let aircraftCount = Math.floor(poker_cards.length / 4);

        let aircraft_arr: Array<number> = [];
        let other_arr: Array<number> = [];
        let pos = -1;
    
        for(let i=0; i<poker_cards.length-2; i++) {
            if(poker_cards[i] == poker_cards[i+1] &&
                poker_cards[i] == poker_cards[i+2]) {
                    aircraft_arr.push(poker_cards[i]);
                    aircraft_arr.push(poker_cards[i+1]);
                    aircraft_arr.push(poker_cards[i+2]);
                    if(pos == -1) pos = i;                
                    
            }
        }

        if(!this.isAircraft(aircraft_arr)) {
            return false;
        }

        for(let i=0; i<pos; i++) {
            other_arr.push(poker_cards[i]);
        }
        for(let i=pos+aircraftCount*3; i<poker_cards.length; i++) {
            other_arr.push(poker_cards[i]);
        }
        
        
        if(other_arr.length == aircraftCount) { // 带单个
            return true;
        }else if(other_arr.length == aircraftCount * 2){ // 带对子
            for(let i=0; i<other_arr.length; i+=2) {
                if(other_arr[i] != other_arr[i+1]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    /**
     * 普通排序比较
     * 单张, 对子, 炸弹, 顺子, 飞机不带, 3不带
     */
    static normalCompare(poker1: Array<poker>, poker2: Array<poker>) {
        poker1.sort(sort_card.gradeUp.bind(sort_card));
        poker2.sort(sort_card.gradeUp.bind(sort_card));
        return sort_card.compareCard(poker1[poker1.length-1], poker2[poker2.length-1])
    }

    /**
     * 3带, 飞机带
     */
    static threeAndAircraftTakeCompare(poker1: Array<poker>, poker2: Array<poker>) {
        let aircraft_arr1: Array<poker> = [];
        let aircraft_arr2: Array<poker> = [];
        for(let i=0; i<poker1.length-2; i++) {
            if(poker1[i].num == poker1[i+1].num &&
            poker1[i].num == poker1[i+2].num) {
                aircraft_arr1.push(poker1[i]);
                aircraft_arr1.push(poker1[i+1]);
                aircraft_arr1.push(poker1[i+2]);            
            }
        }

        for(let i=0; i<poker2.length-2; i++) {
            if(poker2[i].num == poker2[i+1].num &&
            poker2[i].num == poker2[i+2].num) {
                aircraft_arr2.push(poker2[i]);
                aircraft_arr2.push(poker2[i+1]);
                aircraft_arr2.push(poker2[i+2]);            
            }
        }
        return this.normalCompare(aircraft_arr1, aircraft_arr2)
    }
    /**
     * 4带
     */
    static fourTakeCompare(poker1: Array<poker>, poker2: Array<poker>) {
        let bomb_arr1: Array<poker> = [];
        let bomb_arr2: Array<poker> = [];
        for(let i=0; i<poker1.length-3; i++) {
            if(poker1[i].num == poker1[i+1].num &&
                poker1[i].num == poker1[i+2].num &&
                poker1[i+2].num == poker1[i+3].num) {
                bomb_arr1.push(poker1[i]);
                bomb_arr1.push(poker1[i+1]);
                bomb_arr1.push(poker1[i+2]);
                bomb_arr1.push(poker1[i+3]);
                break;
            }
        }

        for(let i=0; i<poker2.length-3; i++) {
            if(poker2[i].num == poker2[i+1].num &&
                poker2[i].num == poker2[i+2].num &&
                poker2[i+2].num == poker2[i+3].num) {
                    bomb_arr2.push(poker2[i]);
                    bomb_arr2.push(poker2[i+1]);
                    bomb_arr2.push(poker2[i+2]);
                    bomb_arr2.push(poker2[i+3]);
                break;
            }
        }
        return this.normalCompare(bomb_arr1, bomb_arr2)
    }
    
    static compareByType(playerCards1: playerPoker, playerCards2: playerPoker) {
        if(playerCards2.type == send_poker_ctl.NONE_CARD) {    // 玩家不出
            return true;
        }
        if(playerCards1.type == send_poker_ctl.KINGBOMB_CARD) {
            return false;
        }

        if(playerCards2.type == send_poker_ctl.KINGBOMB_CARD) {
            return true;
        }

        // 玩家一不是炸弹, 玩家二是炸弹
        if(playerCards1.type != send_poker_ctl.BOMB_CARD 
            && playerCards1.type != send_poker_ctl.KINGBOMB_CARD
            && (playerCards2.type == send_poker_ctl.BOMB_CARD
                || playerCards2.type == send_poker_ctl.KINGBOMB_CARD)) {    
                    return true;
        }else {
            if(playerCards1.type != playerCards2.type) {
                return false;
            }
            if(playerCards1.poker.length != playerCards2.poker.length) {
                return false;   // 类型错误
            }
            if(playerCards1.type == 1 
                || playerCards1.type == 2
                || playerCards1.type == 3
                || playerCards1.type == 8
                || playerCards1.type == 9
                || playerCards1.type == 10
                || playerCards1.type == 13) {
                    return this.normalCompare(playerCards1.poker, playerCards2.poker);
            }else if(playerCards1.type == 4
                || playerCards1.type == 5
                || playerCards1.type == 11
                || playerCards1.type == 12){
                    return this.threeAndAircraftTakeCompare(playerCards1.poker, playerCards2.poker);
            }else if(playerCards1.type == 6
                || playerCards1.type == 7){
                    return this.fourTakeCompare(playerCards1.poker, playerCards2.poker);
            }
        }
    }
    /**
     * 将扑克牌的字符 转换为对应的面值
     * @param poker_arr 
     */
    static _transformation_arr(poker_arr: Array<poker>) {
        let arr: Array<number> = [];
        for(let i=0; i<poker_arr.length; i++) {
            arr.push(sort_card.cardGrade[poker_arr[i].num]);
        }
        return arr;
    }

}


class poker {  
    public num = -1;
    public type = -1;

    constructor(num: number, type: number) {
        this.num = num;
        this.type = type;
    }
}

class sort_card {
    static cardGrade = {
        2: 1,
        3: 2,
        4: 3,
        5: 4,
        6: 5,
        7: 6,
        8: 7,
        9: 8,
        10: 9,
        11: 10,
        12: 11,
        0: 12,  // A

        1: 13,  // 2
        14: 14, // 大王
        13: 15, // 小王
    }

    static gradeUp(poker1: poker, poker2: poker) {
        return this.cardGrade[poker1.num] - this.cardGrade[poker2.num];
    }

    static compareCard(poker1: poker, poker2: poker) {
        if(this.cardGrade[poker1.num] >= this.cardGrade[poker2.num]) {
            return false;
        }else {
            return true;
        }
    }
}


/**
 * static ERROR_CARDS = -1 // 错误牌型
    static NONE_CARD = 0;   // 不出
    static SINGLE_CARD = 1 // 单牌  
    static DOUBLE_CARD = 2 //对子  
    static THREE_CARD = 3 //3不带  
    static THREE_ONE_CARD = 4 //3带1  
    static THREE_TWO_CARD = 5 //3带2  
    static BOMB_TWO_CARD = 6 //四个带2张单牌  
    static BOMB_FOUR_CARD = 7 //四个带2对  
    static CONNECT_CARD = 8 //连牌  
    static COMPANY_CARD = 9 //连队  
    static AIRCRAFT_CARD = 10 //飞机不带  
    static AIRCRAFT_ONE_WING = 11 //飞机带单牌
    static AIRCRAFT_TWO_WING = 12 //飞机带对子
    static BOMB_CARD = 13 //炸弹  
    static KINGBOMB_CARD = 14 //王炸
 */

