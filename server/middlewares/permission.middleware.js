export function checkPer(permissionArr){
    return function (req, res, next){
        if(permissionArr.includes(req.user.permission))
            {console.log(req.user.permission)
            next();}
        else
            return next({status:403, msg:"dont have permission!"});
    }
}