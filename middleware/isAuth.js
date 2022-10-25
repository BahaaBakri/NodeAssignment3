const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    const authorizationHeader = req.get('Authorization');
    if (!authorizationHeader) {
        // Authorization header not exsists
        const error = new Error('Not authonticated user');
        error.statusCode = 401;
        throw error
    }
    // split the token from header
    const tokenFromFront = authorizationHeader.split(' ')[1]
    try {
        // decode and verify token
        decodedToken = jwt.verify(tokenFromFront, 'secret5011')
    }
    catch(err) {
        throw(err)
    }
    if (!decodedToken) {
        // can't verify the token
        const error = new Error('Unauthonticated user');
        error.statusCode = 401;
        throw error
    }
    // we verified the token
    req.userId = decodedToken._id
    next()
}