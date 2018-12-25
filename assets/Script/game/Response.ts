export default class Response {
    static OK: number = 1;
    static Auth = {

    };

    static INVALID_PARAMS: number = -100; // 表示用户传递的参数错误
	static SYSTEM_ERR: number = -101; // 系统错误
    static ILLEGAL_ACCOUNT: number = -102; // 非法的账号
    static INVALIDI_OPT: number = -103; // 非法的操作
    static PHONE_IS_REG: number = -104; // 手机已经被绑定
    static PHONE_CODE_ERR: number =  -105; // 验证码错误
    static UNAME_OR_UPWD_ERR: number = -106; // 用户名后密码错误
    static PHONE_IS_NOT_REG: number = -107; // 手机号为非法的账号
    static RANK_IS_EMPTY: number = -108;
    static INVALID_ZONE =  -109; // 非法的游戏空间
	static CHIP_IS_NOT_ENOUGH = -110; // 金币不足 
    static VIP_IS_NOT_ENOUGH = -111; // vip等级不足
    static NOT_YOUR_TURN = -112; // 没有轮到你
    static UDATA_IS_NOT_ENOUGH = -113;  // udata 房卡不足
    static ERROR_TYPE_CARDS = -114;     // 牌型错误
    static ERROR_SEND_CARDS = -115;     // 出错了牌
    // static ERROR_NOT_BIG_THAN_PRE = -116    // 牌没有上家大
    static ERROR_CAN_NOT_SEND_POKER = -117; // 不能出牌
    static NOT_HAVE_ROOM = -118;    // 不存在这个房间
    static ROOM_FULL_SEAT = -119;    // 满位置
    static ERROR_QUIT_ROOM = -120;  // 退出房间失败
    static ROOM_CARDS_TOO_MANY = -121;  // 房卡太多
    static IS_FRIEND = -122;    // 已经是好友了
    static HAS_SEND_ADD_FRIEND = -123;  // 已经发送了请求

    static HAS_NO_THINGS = 124; // 数据库中没有数据
}