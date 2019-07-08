const { User } = require('../models/User');

let auth = (req, res, next) => {
    let token = req.cookies.auth;
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if (!user) return res.json({
            isAuth: null
        });
        req.token = token;
        req.user = user;
        next();
    })

}

module.exports = { auth }