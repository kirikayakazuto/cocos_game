import poker_card from "./poker_card";

export default class ddz_uitl {
    public static SortCardUseHash(cards: Array<number>)
    {
        let temp: {[key: number]: number} = {};
        
        for (let i = 0; i < cards.length; i++)
        {
            if (cards[i] == 53)
            {
                cards.splice(i, 1);
            }
        }
        for (let i = 0; i < cards.length; i++)
        {
            if (cards[i] == 54)
            {
                cards.splice(i, 1);
            }
        }
        for (let i = 0; i < cards.length; i++)
        {
            if (cards[i] == 13)
            {
                cards.splice(i, 1);
            }
        }
        for (let i = 0; i < cards.length; i++)
        {
            if (temp[cards[i]])
            {
                temp[cards[i]] = temp[cards[i]] + 1;
            }
            else {
                temp[cards[i]] = 1;
            }
        }
        
        return temp;
    }
 
 
    
 
    /**
     * 使用哈希存所有牌 key 权重  value个数
     */
    public static SortCardUseHash1(cards: Array<number>)
    {
        let temp: {[key: number]: number} = {};
        
       
        for (let i = 0; i < cards.length; i++)
        {
            if (temp[cards[i]])
            {
                temp[cards[i]] = temp[cards[i]] + 1;
            }
            else {
                temp[cards[i]] = 1;
            }
        }
 
        return temp;
    }

    public static getMapSize(temp: {[key: number]: number}) {
        let count = 0;
        for(let key in temp) {
            count ++;
        }
        return count;
    }

    public static getNumberArr(arr_poker: Array<poker_card>) {
        let arr: Array<number> = [];
        for(let i=0; i<arr_poker.length; i++) {
            arr.push(arr_poker[i].num);
        }
        return arr;
    }

    public static sortNumber(a: number, b: number) {
        return a - b
    }
}