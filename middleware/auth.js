const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader || authHeader === ''){
        req.isAuth = false;
        return next()
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(authHeader, 'crowedPouchAppBackend');
    } catch (err) {
        req.isAuth = false;
        return next();
    }
    if (!decodedToken) {
        req.isAuth = false;
        return next();
    }
    req.isAuth = true;
    req.userId = decodedToken.userId;
    req.email = decodedToken.email
    return next();
}