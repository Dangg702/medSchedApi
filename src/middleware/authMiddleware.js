const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
dotenv.config();

const nonSecurePath = [
    '/',
    '/api/login',
    'api/register',
    '/api/generate-otp',
    '/api/verify-otp',
    '/api/create-user',
    '/api/get-doctor',
    '/api/get-extra-info-doctor',
    '/api/get-top-doctor',
    '/api/get-all-doctors',
    '/api/get-profile-doctor',
    '/api/get-schedule-time',
];

const verifyToken = (token) => {
    const key = process.env.ACCESS_TOKEN;
    let decode = null;
    try {
        decode = jwt.verify(token, key);
    } catch (error) {
        console.log('Error verifyToken:', error);
    }
    return decode;
};

const extractToken = (req) => {
    if (req.headers && req.headers.authorization) {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
};

const userIsAuthenticated = (req, res, next) => {
    // if (nonSecurePath.includes(req.path)) {
    //     return next();
    // }
    const cookieToken = req.cookies?.access_token;
    const tokenFromHeader = extractToken(req);
    if (cookieToken || tokenFromHeader) {
        let token = cookieToken ? cookieToken : tokenFromHeader;
        const decode = verifyToken(token);
        if (decode) {
            req.user = decode;
            req.token = token;
            next();
        } else {
            return res.status(401).json({
                errCode: '-1',
                message: 'Unauthorization',
            });
        }
    } else {
        return res.status(401).json({
            errCode: '-1',
            message: 'Unauthorization',
        });
    }
};

const checkRole = (req, res, next, allowedRole) => {
    // if (nonSecurePath.includes(req.path)) {
    //     return next();
    // }
    const user = req.user;
    if (user) {
        const role = user.roleId;
        if (role === allowedRole) {
            next();
        } else {
            return res.status(401).json({
                errCode: '-1',
                message: 'Unauthorization',
            });
        }
    } else {
        return res.status(401).json({
            errCode: '-1',
            message: 'Unauthorization',
        });
    }
};

const isAdmin = (req, res, next) => {
    checkRole(req, res, next, 'R1');
};

const isDoctor = (req, res, next) => {
    checkRole(req, res, next, 'R2');
};

const authMiddleware = (req, res, next) => {
    const token = req.cookies.access_token;
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
            if (err) {
                res.render('404', {
                    layout: false,
                    message: 'Unauthorization',
                    status: 'ERROR',
                });
            }
            if (user.isAdmin) {
                next();
            } else {
                // res.redirect('/user/login');
                res.render('403', {
                    layout: false,
                    user,
                    message: 'Unauthorization',
                    status: 'ERROR',
                });
            }
        });
    } else {
        res.redirect('/user/login');
    }
};

const authUserMiddleware = (req, res, next) => {
    const token = req.cookies.access_token;
    const userName = req.params.name;

    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
            if (err) {
                // return res.status(404).json({ message: 'Unauthorization', status: 'ERROR' });
                res.redirect('/user/login');
            }
            if (user.isAdmin || user.name === userName) {
                next();
            } else {
                res.redirect('/user/login');
            }
        });
    } else {
        res.redirect('/user/login');
    }
};

const authenticateToken = (req, res, next) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
        req.user = null;
        next();
    } else {
        jwt.verify(access_token, process.env.ACCESS_TOKEN, function (err, user) {
            if (err) {
                console.error('Error decoding JWT:', err);
                res.render('403', { layout: false });
            } else {
                req.user = user;
                next();
            }
        });
    }
};

module.exports = { authMiddleware, authUserMiddleware, authenticateToken, userIsAuthenticated, isAdmin, isDoctor };
