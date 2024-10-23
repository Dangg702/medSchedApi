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
    console.log(`Verifying token ${token}`);
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
    const cookieToken = req.cookies?.accessToken;
    const tokenFromHeader = extractToken(req);
    console.log('Cookie token:', cookieToken);
    console.log('Header token:', tokenFromHeader);

    if (cookieToken || tokenFromHeader) {
        let token = cookieToken ? cookieToken : tokenFromHeader;

        try {
            const decode = jwt.verify(token, process.env.ACCESS_TOKEN);
            req.user = decode;
            req.token = token;
            next();
        } catch (error) {
            console.log('userIsAuthenticated err', error);
            // Token hết hạn hoặc không hợp lệ
            if (error.name === 'TokenExpiredError') {
                console.log('Access token hết hạn. Thực hiện cấp lại...');
                // Lấy refresh token từ cookie
                const refreshToken = req.cookies?.refreshToken;
                if (!refreshToken) {
                    return res.status(401).json({
                        errCode: '-1',
                        message: 'Refresh token không được cung cấp',
                    });
                }
                // Thực hiện cấp lại access token mới bằng refresh token
                try {
                    const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);

                    // Tạo access token mới
                    const newAccessToken = jwt.sign({ id: decodedRefresh.id }, process.env.ACCESS_TOKEN, {
                        expiresIn: '1d',
                    });

                    // Lưu token mới vào cookie
                    res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: true, sameSite: 'Strict' });

                    // Gắn thông tin người dùng và token mới vào request
                    req.user = decodedRefresh;
                    req.token = newAccessToken;

                    next();
                } catch (refreshError) {
                    return res.status(403).json({
                        errCode: '-1',
                        message: 'Refresh token không hợp lệ hoặc đã hết hạn',
                    });
                }
            } else {
                return res.status(401).json({
                    errCode: '-1',
                    message: 'Access token không hợp lệ',
                });
            }
        }
    } else {
        // Nếu không có token
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
    const token = req.cookies.accessToken;
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
    const token = req.cookies.accessToken;
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
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        req.user = null;
        next();
    } else {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN, function (err, user) {
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
