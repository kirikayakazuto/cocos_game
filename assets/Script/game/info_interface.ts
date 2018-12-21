export interface user_info {
    status?: number, 
    uid?: number, 
    guest_key?: string,
    unick?: string, 
    uname?: string,
    upwd?: string,
    usex?: number, 
    uface?: number, 
    uphone?: string,
    uemail?: string,
    ucity?: string,
    uvip?: number, 
    vip_endtime?: number,
    is_guest?: number,
    user_status?: number,
}

export interface game_info {
    id?: number,
    uid?: number,
    uexp?: number,
    status?: number,
    uchip?: number,
    udata?: number,
    uvip?: number,
    uvip_endtime?: number,
}

export interface bonues_info {
    id?: number,
    uid?: number,
    bonues?: number,
    b_has?: number,
    status?: number,
    bonues_time?: number,
    days?: number,
}