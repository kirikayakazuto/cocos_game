import poker_card from "./poker_card";

export default class playerPoker {
    poker: Array<poker_card> = null;
    type: number = -1;

    constructor(poker: Array<poker_card>, type: number) {
        this.poker = poker;
        this.type = type;
    }
}
