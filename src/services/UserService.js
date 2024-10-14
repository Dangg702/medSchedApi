import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';
import { generateAccessToken, generateRefreshToken } from './JwtService';
import db from '../models';
import EmailService from './EmailService';
import { uploadImage } from '../untils/uploadImage';

let salt = bcrypt.genSaltSync(10);
let otpData = {};

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            const hash = await bcrypt.hashSync(password.trim(), salt);
            resolve(hash);
        } catch (error) {
            reject(error);
        }
    });
};

let checkEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: {
                    email: email,
                },
            });
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (error) {
            reject(error);
        }
    });
};

// Hàm sinh mã OTP ngẫu nhiên với độ dài xác định
let generateOTP = (length) => {
    const digits = '0123456789';
    let OTP = '';

    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }

    return OTP;
};

let generateOTPWithExpiry = () => {
    const otp = generateOTP(6);
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5); // Thời gian hết hạn sau 5 phút

    return { otp, expiry };
};

let sendOtpCode = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            let isExistEmail = await checkEmail(email);
            if (isExistEmail) {
                resolve({
                    errCode: 1,
                    message: 'Your email is already in used. Please try another!',
                });
            } else {
                otpData = generateOTPWithExpiry();
                await EmailService.sendOTPEmail(email, otpData);
                resolve({
                    errCode: 0,
                    message: 'Send opt code successfully!',
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

const verifyOtpCode = (enteredOTP) => {
    return new Promise(async (resolve, reject) => {
        try {
            let result = {};

            if (new Date() > new Date(otpData.expiry)) {
                result = {
                    errCode: 2,
                    message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã OTP mới.',
                };
            }
            if (otpData.otp === enteredOTP) {
                result = {
                    errCode: 0,
                    message: 'Mã OTP hợp lệ.',
                };
            } else {
                result = {
                    errCode: 3,
                    message: 'Mã OTP không đúng. Vui lòng thử lại.',
                };
            }
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
};

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let isExist = await checkEmail(data.email);
            if (isExist) {
                resolve({
                    errCode: 1,
                    message: 'Your email is already in used. Please try another!',
                });
            }
            let hashPassword = await hashUserPassword(data.password);
            await db.User.create({
                email: data.email.trim(),
                password: hashPassword,
                gender: data.gender,
                firstName: data.firstName && data.firstName.trim(),
                lastName: data.lastName && data.lastName.trim(),
                address: data.address && data.address.trim(),
                phoneNumber: data.phoneNumber && data.phoneNumber.trim(),
                roleId: data.role && data.role,
                positionId: data.position && data.position,
                image: data.image && data.image,
            });
            resolve({
                errCode: 0,
                message: 'OK',
            });
        } catch (error) {
            reject(error);
        }
    });
};

let login = (data, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { email, password } = data;
            let userData = {};

            let user = await db.User.findOne({
                where: {
                    email: email,
                },
            });
            if (user) {
                let isPasswordMatch = await bcrypt.compareSync(password, user.password);
                if (isPasswordMatch) {
                    // Generate tokens securely
                    const access_token = generateAccessToken(user);
                    const refresh_token = generateRefreshToken(user);

                    userData.errCode = 0;
                    userData.errMessage = 'Login successful';
                    delete user.password;
                    userData.user = user;
                    userData.tokens = { access_token, refresh_token };

                    resolve(userData);
                } else {
                    (userData.errCode = 3), (userData.errMessage = `Wrong password!`);
                    resolve(userData);
                }
            } else {
                (userData.errCode = 2), (userData.errMessage = `User is not found!`);
                resolve(userData);
            }
        } catch (error) {
            reject(error);
        }
    });
};

let getAllUsers = (userId, page, per_page) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = {};
            const offset = (page - 1) * per_page;

            if (userId && page && per_page && userId === 'ALL') {
                users = await db.User.findAndCountAll({
                    offset,
                    limit: per_page,
                    attributes: {
                        exclude: ['password'],
                    },
                    order: [['id', 'DESC']],
                });
            }

            if (userId && !page && !per_page && userId === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password'],
                    },
                });
            }

            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: {
                        id: userId,
                    },
                    attributes: {
                        exclude: ['password'],
                    },
                });
            }
            // console.log(users);
            resolve(users);
        } catch (error) {
            reject(error);
        }
    });
};

let updateUserData = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: id },
            });
            if (user) {
                if (data.email) {
                    let check = await checkEmail(data.email);
                    if (check === true) {
                        resolve({
                            errCode: 2,
                            message: 'Your email is already in used. Please try another!',
                        });
                    }
                }
                // console.log('updateUserData service', data);
                // await db.User.update(
                //     {
                //         gender: data.gender,
                //         firstName: data.firstName && data.firstName.trim(),
                //         lastName: data.lastName && data.lastName.trim(),
                //         address: data.address && data.address.trim(),
                //         phoneNumber: data.phoneNumber && data.phoneNumber.trim(),
                //         roleId: data.role && data.role,
                //         positionId: data.position && data.position,
                //         image: data.image && data.image,
                //     },
                //     {
                //         where: {
                //             id: id,
                //         },
                //     },
                // );
                resolve({
                    errCode: 0,
                    message: 'OK',
                });
            } else {
                resolve({
                    errCode: 2,
                    message: 'User is not exist',
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

let deleteUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let status = await db.User.destroy({
                where: {
                    id: id,
                },
            });
            if (status) {
                resolve({
                    errCode: 0,
                    message: 'OK',
                });
            } else {
                resolve({
                    errCode: 2,
                    message: 'User is not exist!',
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

let getAllCodeServices = (type) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = {};
            if (!type) {
                response.errCode = 1;
                response.message = 'Missing required parameter. Please check again!';
            }
            let allCode = await db.Allcode.findAll({ where: { type: type } });
            response.errCode = 0;
            response.data = allCode;
            resolve(response);
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = {
    createNewUser,
    getAllUsers,
    updateUserData,
    deleteUser,
    login,
    getAllCodeServices,
    checkEmail,
    sendOtpCode,
    verifyOtpCode,
};
