/* 
export default class EXDataView extends DataView {

    constructor(buffer: ArrayBuffer, byteOffset?: number, byteLength?: number) {
        super(buffer, byteOffset, byteLength);
    }

    read_utf8(offset: number, byte_length) {
        let out: string, i: number, len: number, c;
        let char2, char3;
        let dataview = this;

        out = "";
        len = offset + byte_length;
        i = offset;
        while(i < len) {
            c = dataview.getUint8(i);
            i ++;
            switch(c >> 4)
            { 
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = Array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = dataview.getUint8(i);
                i ++;
                char3 = dataview.getUint8(i);
                i ++;
                out += String.fromCharCode(((c & 0x0F) << 12) |
                            ((char2 & 0x3F) << 6) |
                            ((char3 & 0x3F) << 0));
                break;
            }
        }

        return out;
    }

    write_utf8(offset: number, str: string) {
        let now: number = offset;
        let dataview = this;

        for (let i = 0; i < str.length; i++) {
            let charcode = str.charCodeAt(i);
            if (charcode < 0x80) { 
                dataview.setUint8(now, charcode);
                now ++;
            }
            else if (charcode < 0x800) {
                dataview.setUint8(now, (0xc0 | (charcode >> 6)));
                now ++;

                dataview.setUint8(now, 0x80 | (charcode & 0x3f));
                now ++;
            }
            else if (charcode < 0xd800 || charcode >= 0xe000) {

                dataview.setUint8(now, 0xe0 | (charcode >> 12));
                now ++;

                dataview.setUint8(now, 0x80 | ((charcode>>6) & 0x3f));
                now ++;

                dataview.setUint8(now, 0x80 | (charcode & 0x3f));
                now ++;
            }
            // surrogate pair
            else {
                i ++;

                charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                        | (str.charCodeAt(i) & 0x3ff));

                dataview.setUint8(now, 0xf0 | (charcode >>18));
                now ++;

                dataview.setUint8(now, 0x80 | ((charcode>>12) & 0x3f));
                now ++;

                dataview.setUint8(now, 0x80 | ((charcode>>6) & 0x3f));
                now ++;

                dataview.setUint8(now, 0x80 | (charcode & 0x3f));
                now ++;
            }
        }
    }
} */