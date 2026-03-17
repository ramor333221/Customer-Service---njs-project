import jwt from "jsonwebtoken"

export const auth = (req, res, next) => {
    // invalid token - synchronous
    const { authorization } = req.headers;
    const [, token] = authorization.split(' ');

    try {
        // payload כאן ייכנס האוביקט
        const user = jwt.verify(token, process.env.JWT_SECRET);

        // העברת ההרשאות הלאה לקונטרולר
        req.user = user;
        return next();
    } catch (error) {
        // verify לכאן מגיע אם נכשל
        return next({ msg: 'no premission' });
        // 401/403
    }
};
