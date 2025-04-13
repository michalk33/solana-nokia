exports.REFRESH_VALID_TIME = 120;
exports.NUMBER_PER_PAGE = 10;
exports.ctrlNum = 0;
exports.ctrlMod = 1000000;

// now not used
exports.User = class User{
    constructor(validTime = exports.REFRESH_VALID_TIME, logged = false){
        this.time = validTime;
        this.logged = logged;
        this.ctrlNum = exports.ctrlNum;
        exports.ctrlNum++;
        exports.ctrlNum %= exports.ctrlMod;
    }
}

exports.nav_browse = function(req, len){
    var npp = Number(req.query.npp);
    var np = Number(req.query.np);
    if(npp == undefined || Number.isNaN(npp)) npp = exports.NUMBER_PER_PAGE;
    if(np == undefined || Number.isNaN(np)) np = 0;
    if( np < 0 ) np = 0;

    var mx_num = len;
    if((np-1)*npp >= mx_num) np = (mx_num-1-(mx_num-1)%npp)/npp + 1;
    var begv = np*npp;
    var endv = (np+1)*npp;
    if(endv > mx_num) endv = mx_num;
    if(begv >= mx_num) begv = mx_num-1-(mx_num-1)%npp;
    if(mx_num == 0) {begv = 0; np = 0;}
    ret = {np: np, npp: npp, mx_num: mx_num, begv: begv, endv: endv};
    return ret;
}