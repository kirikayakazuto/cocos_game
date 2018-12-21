import poker_card from "./poker_card";

export default class sort_card {
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
        0: 12,
        1: 13,
        14: 14,
        13: 15,
    }

    static gradeDoun(poker1: any, poker2: any) {
        if(this.cardGrade[poker1["num"]] > this.cardGrade[poker2["num"]]) {
            return -1;
        }else if(this.cardGrade[poker1["num"]] < this.cardGrade[poker2["num"]]){
            return 1;
        }else {
            return poker1["type"] > poker2["type"] ? -1 : 1;
        }
    }

    static gradeDownPoker(poker1: poker_card, poker2: poker_card) {
        return this.cardGrade[poker2.num] - this.cardGrade[poker1.num];
    }
}