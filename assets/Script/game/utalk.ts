export default class utalk {
    static talk_msg: {[key: string]: Array<TalkMsg>} = {};
    /**
     * 保存信息
     */
    static save_talk_msg(body: any) {
        let talkMsg = new TalkMsg(body[0], body[1], body[2], body[3]);
        if(this.talk_msg[talkMsg.name]) {
            this.talk_msg[talkMsg.name].push(talkMsg);
        }else {
            this.talk_msg[talkMsg.name] = [talkMsg];
        }
        
    }
    /**
     * 获取和某个人的聊天信息
     */
    static get_unread_msg_by_fname(fname: string) {
        return this.talk_msg[fname];
    }
}

class TalkMsg {
    who = "";
    
    name = "";
    msg = "";
    time = "";

    constructor(who: string, name: string, msg: string, time: string) {
        this.who = who;
     
        this.name = name;
        this.msg = msg;
        this.time = time;
    }
}