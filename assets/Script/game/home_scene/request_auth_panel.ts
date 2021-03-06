import { user_info } from "../info_interface";
import ugame from "../ugame";
import auth from "../protobufs/auth";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property([cc.SpriteFrame])
    usex_sp: Array<cc.SpriteFrame> = [];

    @property(cc.Prefab)
    request_user_item: cc.Prefab = null;
    @property(cc.Node)
    error_node: cc.Node = null;

    @property(cc.Node)
    contentNode: cc.Node = null;

    request_auth_list: Array<user_info> = [];

    onLoad () {
        // 获取请求玩家信息列表 展示
        this.request_auth_list = ugame.get_request_auth_list();
        this.show_uinfo_item();
        // end
    }

    start () {
        
    }
    /**
     * 展示申请玩家的信息列表
     * 添加接受, 拒绝按钮响应事件
     * 
     */
    show_uinfo_item() {
        let uinfo = this.request_auth_list;
        console.log(uinfo);
        if(uinfo == null || uinfo.length <=0) {
            this.error_node.active = true;
            return ;
        }
        this.error_node.active = false;
        // 添加接受, 拒绝按钮事件
        for(let i=0; i<uinfo.length; i++) {
            let node = cc.instantiate(this.request_user_item);
            node.getChildByName("unick").getComponent(cc.Label).string = uinfo[i].unick;
            node.getChildByName("uname").getComponent(cc.Label).string = uinfo[i].uname;
            node.getChildByName("usex").getComponent(cc.Sprite).spriteFrame = this.usex_sp[uinfo[i].usex];
            node.getChildByName("vip").getChildByName("viplevel").getComponent(cc.Label).string = "" +uinfo[i].uvip;

            let yes_node = node.getChildByName("submit");
            this.add_button_handler(yes_node, "yes_button_click", [uinfo[i].uname, '1']);   // 同意是1
    
            let no_node = node.getChildByName("nosubmit");
            this.add_button_handler(no_node, "no_button_click", [uinfo[i].uname, '0']); // 不同意是0

            node.parent = this.contentNode;
        }
    }

    add_button_handler(node: cc.Node, callback: string, data: Array<string>) {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; //这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "request_auth_panel"; //这个是代码文件名
        clickEventHandler.handler = callback;
        clickEventHandler.customEventData = data.join(','); // 数组转字符串, 用,拼接
        let button = node.getComponent(cc.Button);
        button.clickEvents.push(clickEventHandler);
    }
    /**
     * 删除处理过的验证请求
     */
    remove_item_by_uname(uname: string) {
        
        for(let i=0; i<this.contentNode.children.length; i++) {
            if(this.contentNode.children[i].getChildByName("uname")
            && this.contentNode.children[i].getChildByName("aleady_deal").active != true
            && this.contentNode.children[i].getChildByName("uname").getComponent(cc.Label).string == uname) {
                // this.contentNode.children[i].removeFromParent();
                this.contentNode.children[i].getChildByName("submit").active = false;
                this.contentNode.children[i].getChildByName("nosubmit").active = false;
                this.contentNode.children[i].getChildByName("aleady_deal").active = true;
            }
        }
        console.log("remove ", this.contentNode.children.length);
        let flag = false;
        for(let i=0; i<this.contentNode.children.length; i++) {
            if(this.contentNode.children[i].getChildByName("uname")
            && this.contentNode.children[i].getChildByName("aleady_deal").active != true) {
                flag = true
            }
        }
        if(!flag) {
            this.error_node.active = true;
        }
    }
    /**
     * 
     * @param e 
     * @param data 
     */
    yes_button_click(e, data: string) {
        // 接收请求
        console.log(data);
        let body = data.split(',')
        auth.response_friend_request(body);
    }

    no_button_click(e, data) {
        // 拒绝请求
        console.log(data);
        let body = data.split(',')
        auth.response_friend_request(body);
    }

    // update (dt) {}
}
