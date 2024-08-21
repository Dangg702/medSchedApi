const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateAccessToken = (payload) => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
    return accessToken;
};

const generateRefreshToken = (payload) => {
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: '365d' });
    return refreshToken;
};

const refreshTokenJwtService = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.REFRESH_TOKEN, (err, user) => {
            if (err) {
                console.error(err);
                resolve({
                    message: 'The authenticated',
                    status: -1,
                });
            }
            const accessToken = generateAccessToken({ id: user.id, isAdmin: user.isAdmin });
            console.log('accessToken: ', accessToken);
            resolve({
                message: 'Success',
                status: 0,
                accessToken,
            });
        });
    });
};

const setAccessTokenCookie = (res, accessToken) => {
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Đặt secure thành true trong môi trường production
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // Thời gian sống của cookie: 1 ngày
    });
};

const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Đặt secure thành true trong môi trường production
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60 * 1000, // Thời gian sống của cookie: 1 năm
    });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    refreshTokenJwtService,
    setAccessTokenCookie,
    setRefreshTokenCookie,
};
