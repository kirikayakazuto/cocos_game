import send_poker_ctl from "./send_poker_ctl";
import ddz_uitl from "./ddz_util";

export default class cards_compare {
    public static isShowOutCardBtn(myCards: Array<number>,
        lastCards: Array<number>, lastCardType: number) {
            // 我的牌	myCards
		// 上一家出的牌 lastCards	
		// lastCardType上一家出的牌的类型
 
        // 上一首牌的个数
        let prevSize = lastCards.length;
        let mySize = myCards.length;
 
        // 我先出牌，上家没有牌
        if (prevSize == 0 && mySize != 0) {
            return true;
        }
 
        // 集中判断是否王炸，免得多次判断王炸
        if (lastCardType == send_poker_ctl.KINGBOMB_CARD) {
            console.log("上家王炸，肯定不能出。");
            return false;
        }
		
		// 我手中有王炸, 不显示要不起的按钮
        if (mySize >= 2) {
            let cards = new Array<number>();
            cards.push(myCards[0]);
            cards.push(myCards[1]);
            if (send_poker_ctl.isKingBombCard(cards)) {
                return true;
            }
        }
 
        // 集中判断对方不是炸弹，我出炸弹的情况
        if (lastCardType != send_poker_ctl.BOMB_CARD) {
            if (mySize > 4) {
                for (let i = 0; i < mySize - 3; i++) {
                    let grade0 = myCards[i];
                    let grade1 = myCards[i + 1];
                    let grade2 = myCards[i + 2];
                    let grade3 = myCards[i + 3];
 
                    if (grade1 == grade0 && grade2 == grade0
                            && grade3 == grade0)
                    {
                        return true;
                    }
                }
            }
        }
        let prevGrade = lastCards[0];	// 上一个玩家出的第一张牌
        console.log("prevGrade"+prevGrade);
 
        // 比较2家的牌，主要有2种情况，1.我出和上家一种类型的牌，即对子管对子；
        // 2.我出炸弹，此时，和上家的牌的类型可能不同
        // 王炸的情况已经排除
 
        // 上家出单
        if (lastCardType == send_poker_ctl.SINGLE_CARD) {
            // 一张牌可以大过上家的牌
            for (let i = mySize - 1; i >= 0; i--) {
                let grade = myCards[i];
                console.log("grade" + grade);
                if (grade > prevGrade) {
                    // 只要有1张牌可以大过上家，则返回true
                    return true;
                }
            }
 
        }
        // 上家出对子
        else if (lastCardType == send_poker_ctl.DOUBLE_CARD) {
            // 2张牌可以大过上家的牌
            for (let i = mySize - 1; i >= 1; i--)
            {
                let grade0 = myCards[i];
                let grade1 = myCards[i-1];
 
                if (grade0 == grade1)
                {
                    if (grade0 > prevGrade)
                    {
                        // 只要有1对牌可以大过上家，则返回true
                        return true;
                    }
                }
            }
        }
        // 上家出3不带
        else if (lastCardType == send_poker_ctl.THREE_CARD) {
            // 3张牌可以大过上家的牌
            for (let i = mySize - 1; i >= 2; i--)
            {
                let grade0 = myCards[i];
                let grade1 = myCards[i - 1];
                let grade2 = myCards[i - 2];
 
                if (grade0 == grade1 && grade0 == grade2)
                {
                    if (grade0 > prevGrade)
                    {
                        // 只要3张牌可以大过上家，则返回true
                        return true;
                    }
                }
            }
 
        }
        // 上家出3带1
        else if (lastCardType == send_poker_ctl.THREE_ONE_CARD)
        {
            // 3带1 3不带 比较只多了一个判断条件
            if (mySize < 4)
            {
                return false;
            }
 
            // 3张牌可以大过上家的牌
            for (let i = mySize - 1; i >= 2; i--)
            {
                let grade0 = myCards[i];
                let grade1 = myCards[i - 1];
                let grade2 = myCards[i - 2];
 
                if (grade0 == grade1 && grade0 == grade2)
                {
                    if (grade0 > lastCards[1])
                    {
                        // 只要3张牌可以大过上家，则返回true
                        return true;
                    }
                }
            }
 
        }
        // 上家出3带2
        else if (lastCardType == send_poker_ctl.THREE_TWO_CARD)
        {
            // 3带1 3不带 比较只多了一个判断条件
            if (mySize < 5)
            {
                return false;
            }
 
            // 3张牌可以大过上家的牌
            for (let i = mySize - 1; i >= 2; i--)
            {
                let grade0 = myCards[i];
                let grade1 = myCards[i - 1];
                let grade2 = myCards[i - 2];
 
                if (grade0 == grade1 && grade0 == grade2)
                {
                    if (grade0 > lastCards[2])
                    {
                        // 只要3张牌可以大过上家，则返回true      ---这里需要判断除了这三张是否拥有对子
                        myCards.splice(i, 1);
                        myCards.splice(i-1, 1);
                        myCards.splice(i - 2, 1);
                        for (let j = myCards.length - 1; j >= 1; j--) {
                            let temp0 = myCards[j];
                            let temp1= myCards[j-1];
                            if (temp0 == temp1)
                            {
                                return true;
                            }
                        }
                    }
                }
            }
 
        }
        // 上家出炸弹
        else if (lastCardType == send_poker_ctl.BOMB_CARD)
        {
            // 4张牌可以大过上家的牌
            for (let i = mySize - 1; i >= 3; i--)
            {
                let grade0 = myCards[i];
                let grade1 = myCards[i - 1];
                let grade2 = myCards[i - 2];
                let grade3 = myCards[i - 3];
 
                if (grade0 == grade1 && grade0 == grade2 && grade0 == grade3)
                {
                    if (grade0 > prevGrade)
                    {
                        // 只要有4张牌可以大过上家，则返回true
                        return true;
                    }
                }
            }
 
        }
        // 上家出4带2 
        else if (lastCardType == send_poker_ctl.BOMB_TWO_CARD)
        {
            // 4张牌可以大过上家的牌
            for (let i = mySize - 1; i >= 3; i--)
            {
                let grade0 = myCards[i];
                let grade1 = myCards[i - 1];
                let grade2 = myCards[i - 2];
                let grade3 = myCards[i - 3];
 
                if (grade0 == grade1 && grade0 == grade2 && grade0 == grade3)
                {
                    // 只要有炸弹，则返回true
                    return true;
                }
            }
        }
        // 上家出顺子
        else if (lastCardType == send_poker_ctl.CONNECT_CARD)
        {
            if (mySize < prevSize)
            {
                return false;
            }
            else
            {
                let myCardsHash = ddz_uitl.SortCardUseHash(myCards);
                if (ddz_uitl.getMapSize(myCardsHash) < prevSize) {
                    console.log("hash的总数小于顺子的length 肯定fales");
                    return false;
                }
                let myCardsHashKey = new Array<number>();
                for (let key in myCardsHash)
                {
                    myCardsHashKey.push(parseInt(key));
                }
                myCardsHashKey.sort(ddz_uitl.sortNumber);
                
                console.log(myCardsHashKey.toString());
                for (let i = myCardsHashKey.length - 1; i >= prevSize - 1; i--)
                {
                    let cards = new Array<number>();
                    for (let j = 0; j < prevSize; j++) {
                        cards.push(myCardsHashKey[myCardsHashKey.length - 1-i+j]);
                    }
                    console.log(cards.toString());
                    let isRule = send_poker_ctl.isConnectCard(cards);
                    //是不是顺子
                    if (isRule)
                    {
                        let myGrade2 = cards[cards.length - 1];// 最大的牌在最后
                        let prevGrade2 = lastCards[prevSize - 1];// 最大的牌在最后
 
                        if (myGrade2 > prevGrade2)
                        {
                            return true;
                        }
                    }
                }
            }
 
        }
        // 上家出连对
        else if (lastCardType == send_poker_ctl.COMPANY_CARD)
        {
            if (mySize < prevSize)
            {
                return false;
            }
            else
            {
                let myCardsHash = ddz_uitl.SortCardUseHash(myCards);
                if (ddz_uitl.getMapSize(myCardsHash) < prevSize)
                {
                    console.log("hash的总数小于顺子的length 肯定fales");
                    return false;
                }
                let myCardsHashKey = new Array<number>();
                for (let key in myCardsHash)
                {
                    myCardsHashKey.push(parseInt(key));
                }
                myCardsHashKey.sort(ddz_uitl.sortNumber);
                for (let i = myCardsHashKey.length - 1; i >= prevSize - 1; i--)
                {
                    let cards = new Array<number>();
                    for (let j = 0; j < prevSize; j++)
                    {
                        cards.push(myCardsHashKey[myCardsHashKey.length - 1 - i + j]);
                    }
                    
                    let isRule = send_poker_ctl.isCompanyCard(cards);
                    if (isRule)
                    {
                        let myGrade2 = cards[cards.length - 1];// 最大的牌在最后
                        let prevGrade2 = lastCards[prevSize - 1];// 最大的牌在最后
 
                        if (myGrade2 > prevGrade2)
                        {
                            for (let ii = 0; ii < cards.length; ii++) {
                                if (myCardsHash[cards[ii]] < 2)
                                {
                                    console.log("是顺子但不是双顺");
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
 
        }
        //上家出飞机
        else if (lastCardType == send_poker_ctl.AIRCRAFT_CARD)
        {
            if (mySize < prevSize)
            {
                return false;
            }
            else
            {
                for (let i = 0; i <= mySize - prevSize; i++)
                {
                    let cards = new Array<number>();
                    for (let j = 0; j < prevSize; j++)
                    {
                        cards.push(myCards[i + j]);
                    }
                    let isRule = send_poker_ctl.isAircraft(cards);
                    if (isRule)
                    {
                        let myGrade4 = cards[4];//
                        let prevGrade4 = lastCards[4];//
 
                        if (myGrade4 > prevGrade4)
                        {
                            return true;
                        }
                    }
                }
            }
        }
        //上家出飞机带单
        else if (lastCardType == send_poker_ctl.AIRCRAFT_ONE_WING)
        {
            if (mySize < prevSize)
            {
                return false;
            }
            else
            {
                for (let i = 0; i <= mySize-prevSize; i++)
                {
                    let cards = new Array<number>();
                    for (let j = 0; j < prevSize-(prevSize/4); j++)
                    {
                        cards.push(myCards[i + j]);
                    }
 
                    
                    let isRule = send_poker_ctl.isAircraftWing(cards);
                    if (isRule)
                    {
                        let myGrade4 = cards[4];//
                        let prevGrade4 = lastCards[4];//
 
                        if (myGrade4 > prevGrade4)
                        {
                            return true;
                        }
                    }
                }
            }
        }
 
        //上家出飞机带双
        else if (lastCardType == send_poker_ctl.AIRCRAFT_TWO_WING)
        {
            if (mySize < prevSize)
            {
                return false;
            }
            else
            {
                for (let i = 0; i <= mySize - prevSize; i++)
                {
                    let cards = new Array<number>();
                    for (let j = 0; j < prevSize - (prevSize / 5); j++)
                    {
                        cards.push(myCards[i + j]);
                    }
 
                    
                    let isRule = send_poker_ctl.isAircraftWing(cards);
                    if (isRule)
                    {
                        let myGrade4 = cards[4];//
                        let prevGrade4 = lastCards[4];//
 
                        if (myGrade4 > prevGrade4)
                        {
                            let tempTwoArray = new Array<number>();
                            for (let ii = 0; ii < cards.length; ii++)
                            {
                                let templet = 0;
                                for (let j = 0; j < cards.length; j++)
                                {
 
                                    if (cards[ii] == cards[j])
                                    {
                                        templet++;
                                    }
 
                                }
                                if (templet == 2)
                                {
                                    tempTwoArray.push(cards[ii]);
                                }
 
                            }
                            if (tempTwoArray.length / 2 < prevSize / 5)
                            {
 
                                return false;
                            }
                            else {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        // 默认不能出牌
        return false;


    }
}

/* let myCards = [12, 11, 10, 9, 9, 8, 8, 7,7, 6, 4,4, 3, 3, 2, 1, 1, 1];
let lastCards = [9, 8, 7, 6, 5];
let type = 8;

console.log(cards_compare.isShowOutCardBtn(myCards, lastCards, type));
 */