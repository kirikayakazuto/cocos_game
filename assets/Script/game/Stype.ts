export default class Stype {
    /**
     * ---------------------------------- 测试服务 -----------------------------------------
     */
     
    /**
     * ----------------------------------- 登录服务 -----------------------------------------------
     * auth 服务用户 账号的登录验证,   游客账号
     *  GUEST_LOGIN: 1, // 游客登录
        RELOGIN: 2, // 账号在另外的地方登陆
        EDIT_PROFILE: 3,    // 修改用户资料
        GUEST_UPGRADE_INDENTIFY: 4, // 游客账号升级
        BIND_PHONE_NUM: 5, // 游客绑定手机账号
        UNAME_LOGIN: 6, // 账号密码登录
        
        GET_PHONE_REG_VERIFY: 7, // 获取手机注册的验证码
        PHONE_REG_ACCOUNT: 8, // 手机注册我们的账号,
        
        GET_FORGET_PWD_VERIFY: 9, // 获取修改密码的手机验证码
		RESET_USER_PWD: 10, // 重置用户密码
     */
    // 服务号
    static TalkRoom: number = 1;  
    
    static Auth:number =  2;

    /**
     * ---------------------------------- 正式的游戏服务 -------------------------------
     */
    static GAME_SYSTEM: number = 3;
    static GAME_FIVE_CHESS: number = 4;
    static GAME_DOU_DI_ZHU: number = 5;

    // 广播协议
    static Broadcast: number = 10000;

}