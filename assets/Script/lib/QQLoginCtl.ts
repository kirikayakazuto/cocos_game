export default class QQLoginCtl {

    static appid = "9665978216";
    static appsig= '';
    static appsigData= '';
    static qbopenid= '';
    static qbopenkey= '';
    static refreshToken= '';
    static nickName= '';
    static avatarUrl= '';

    static init() {
        this.getAvailableLoginType();
    }

    static getAvailableLoginType() {
        window["QBH5"].getAvailableLoginType(
            {
                appid: QQLoginCtl.appid,
            }, (rsp) => {
                console.log("rsp: ", rsp);
        });
    }

    /**
     * 登录回调
     */
    static loginCallBack(rsp) {
        console.log("loginCallBack= ",rsp);
    }
}