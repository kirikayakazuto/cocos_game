import http = require("../modules/http.js");
import websocket from "../modules/websocket";
import proto_man from "../modules/proto_man"
const {ccclass, property} = cc._decorator;

@ccclass
export default class net_connect extends cc.Component {

    @property(Number)
    is_proto_json: boolean = true;
    // LIFE-CYCLE CALLBACKS:


    server_info = null;
    // onLoad () {}

    start () {
        this.get_server_info();
    }

    get_server_info() {
        let url = "http://127.0.0.1:10001";
        // let url = "http://106.13.53.55:10001";
        http.get(url, "/server_info", null, (err, ret) => {
            if(err) {
                console.log(err);
                this.scheduleOnce(this.get_server_info.bind(this), 3);
                return ;
            }
 
            let data = JSON.parse(ret);
            this.server_info = data;
            this.connect_to_server();
        });
    }

    connect_to_server() {
        if (this.is_proto_json) {
            websocket.connect("ws://" + this.server_info.host + ":" + this.server_info.ws_port + "/ws", proto_man.PROTO_JSON);
        }
        else {
            websocket.connect("ws://" + this.server_info.host + ":" + this.server_info.tcp_port + "/ws", proto_man.PROTO_BUF);
        }
    }

    // update (dt) {}
}
