import proto_man from "./proto_man"


export default class  websocket {
    static sock:WebSocket = null;
    static services_handler = null;
    static proto_type: number = null;
    static is_connected: boolean = false;

    // 开启连接
    static _on_opened(event: MessageEvent) {
        console.log("ws connect server success");
        this.is_connected = true;
    }
    // 收到数据
    static _on_recv_data(event: MessageEvent) {
        let str_or_buf = event.data;
        if(!this.services_handler) {
            return null;
        }
        // stype ctype body 三个
        let cmd = proto_man.decode_cmd(this.proto_type, str_or_buf);
        if(!cmd) {
            return null;
        }

        let stype = cmd[0];
        if(this.services_handler[stype]) {
            this.services_handler[stype](cmd[0], cmd[1], cmd[2]);
        }
    }
    // 关闭sock
    static _on_socket_close(event: MessageEvent) {
        if(this.sock) {
            this.sock.close();
        }
    }
    // 客户端出错 error
    static _on_socket_err(event: MessageEvent) {
        this.sock.close();
    }
    // 连接服务器
    static connect(url: string, proto_type: number) {
        this.sock = new WebSocket(url);
        this.sock.binaryType = "arraybuffer";

        this.sock.onopen = this._on_opened.bind(this);
        this.sock.onmessage = this._on_recv_data.bind(this);
        this.sock.onclose = this._on_socket_close.bind(this);
        this.sock.onerror = this._on_socket_err.bind(this);

        this.proto_type = proto_type;
    }
    // 发送消息给服务器
    static send_cmd(stype: number, ctype: number, body: any) {
        if(!this.sock || !this.is_connected) {
            console.log("send_cmd error");
            return null;
        }
        let buf: Buffer = proto_man.encode_cmd(this.proto_type, stype, ctype, body);
        this.sock.send(buf);
    }

    static close() {
        this.is_connected = false;
        if(this.sock !== null) {
            this.sock.close();
            this.sock = null;
        }
    }

    //  注册服务
    static register_services_handler(services_handler) {
        this.services_handler = services_handler;
    }

    static add_services_handler(stype: number, func: any) {
        this.services_handler[stype] = func;
    }

}

// 连接服务器
// websocket.connect("ws://127.0.0.1:6081/ws", proto_man.PROTO_JSON);
// websocket.connect("ws://127.0.0.1:6081/ws", proto_man.PROTO_BUF);

