import db from '../models';
import _ from 'lodash';
import moment from 'moment';
import dotenvFlow from 'dotenv-flow';
import { where } from 'sequelize';
dotenvFlow.config();
const MAX_SCHEDULE_NUMBER = process.env.MAX_SCHEDULE_NUMBER || 10;

const getTopDoctor = (limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = {};
            let doctors = await db.User.findAll({
                limit: limit,
                order: [['createdAt', 'DESC']],
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password'],
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
                ],
                raw: true,
                nest: true,
            });

            response.errCode = 0;
            response.doctors = doctors;
            resolve(response);
        } catch (err) {
            reject(err);
        }
    });
};

const getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image'],
                },
                raw: true,
                nest: true,
            });
            resolve({
                errCode: 0,
                doctors,
            });
        } catch (err) {
            reject(err);
        }
    });
};

const postInfoDoctor = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (
                !data.selectedDoctor.value ||
                !data.contentHtml ||
                !data.contentMarkdown ||
                !data.description ||
                !data.action ||
                !data.selectedPrice ||
                !data.selectedCity ||
                !data.selectedPayment ||
                !data.nameClinic ||
                !data.addressClinic ||
                !data.note
            ) {
                resolve({
                    errCode: 1,
                    message: 'Missing required parameter. Please check again!',
                });
            } else {
                // for markdown table
                if (data.action === 'create') {
                    await db.Markdown.create({
                        doctorId: +data.selectedDoctor.value,
                        contentHtml: data.contentHtml,
                        contentMarkdown: data.contentMarkdown,
                        description: data.description,
                    });
                    resolve({
                        errCode: 0,
                        message: 'Save successfully!',
                    });
                } else if (data.action === 'edit') {
                    await db.Markdown.update(
                        {
                            contentHtml: data.contentHtml,
                            contentMarkdown: data.contentMarkdown,
                            description: data.description,
                        },
                        { where: { doctorId: +data.selectedDoctor.value } },
                    );
                    resolve({
                        errCode: 0,
                        message: 'Update successfully!',
                    });
                }

                //upsert to doctor_info table
                let doctorInfo = await db.DoctorInfo.findOne({
                    where: { doctorId: +data.selectedDoctor.value },
                });
                if (doctorInfo) {
                    await db.DoctorInfo.update(
                        {
                            priceId: data.selectedPrice,
                            provinceId: data.selectedCity,
                            paymentId: data.selectedPayment,
                            addressClinic: data.addressClinic,
                            nameClinic: data.nameClinic,
                            note: data.note,
                        },
                        { where: { doctorId: +data.selectedDoctor.value } },
                    );
                    resolve({
                        errCode: 0,
                        message: 'Update successfully!',
                    });
                } else {
                    await db.DoctorInfo.create({
                        doctorId: +data.selectedDoctor.value,
                        priceId: data.selectedPrice,
                        provinceId: data.selectedCity,
                        paymentId: data.selectedPayment,
                        addressClinic: data.addressClinic,
                        nameClinic: data.nameClinic,
                        note: data.note,
                        count: 0,
                    });
                    resolve({
                        errCode: 0,
                        message: 'Create successfully!',
                    });
                }
            }
        } catch (err) {
            reject(err);
        }
    });
};

const getDoctorById = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctorData = await db.User.findOne({
                where: { id: doctorId, roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'gender', 'roleId', 'positionId', 'createdAt', 'updatedAt'],
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    {
                        model: db.Markdown,
                        as: 'markdownData',
                        attributes: ['description', 'contentHtml', 'contentMarkdown'],
                    },
                    {
                        model: db.DoctorInfo,
                        as: 'doctorInfoData',
                        attributes: {
                            exclude: ['id', 'doctorId', 'createdAt', 'updatedAt'],
                        },
                        include: [
                            { model: db.Allcode, as: 'priceData', attributes: ['valueEn', 'valueVi'] },
                            { model: db.Allcode, as: 'paymentData', attributes: ['valueEn', 'valueVi'] },
                            { model: db.Allcode, as: 'provinceData', attributes: ['valueEn', 'valueVi'] },
                        ],
                    },
                ],
                raw: true,
                nest: true,
            });
            if (!doctorData) {
                doctorData: {
                }
            }
            resolve({
                errCode: 0,
                data: doctorData,
            });
        } catch (error) {
            reject(error);
        }
    });
};

const getProfileDoctorById = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctorData = await db.User.findOne({
                where: { id: doctorId },
                attributes: ['image', 'firstName', 'lastName'],
                include: [
                    {
                        model: db.DoctorInfo,
                        as: 'doctorInfoData',
                        attributes: ['addressClinic'],
                        include: [{ model: db.Allcode, as: 'priceData', attributes: ['valueEn', 'valueVi'] }],
                    },
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                ],
                raw: true,
                nest: true,
            });
            if (!doctorData) {
                doctorData = {};
            }
            resolve({
                errCode: 0,
                data: doctorData,
            });
        } catch (err) {
            reject(err);
        }
    });
};

const getExtraInfoDoctorById = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctorData = await db.DoctorInfo.findOne({
                where: { id: doctorId },
                attributes: {
                    exclude: ['id', 'doctorId', 'createdAt', 'updatedAt'],
                },
                include: [
                    { model: db.Allcode, as: 'priceData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'paymentData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'provinceData', attributes: ['valueEn', 'valueVi'] },
                ],
                raw: true,
                nest: true,
            });
            if (!doctorData) {
                doctorData: {
                }
            }
            resolve({
                errCode: 0,
                data: doctorData,
            });
        } catch (error) {
            reject(error);
        }
    });
};

const createScheduleTime = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.dataArr || !data.doctorId || !data.date) {
                resolve({
                    errCode: 1,
                    message: 'Invalid data. Please check again!',
                });
            } else {
                let schedule = data.dataArr;
                schedule.map((item) => {
                    item.maxNumber = +MAX_SCHEDULE_NUMBER;
                    // item.currentNumber = item.currentNumber ? +item.currentNumber + 1 : 0;
                    return item;
                });

                let existed = await db.Schedule.findAll({
                    where: {
                        doctorId: schedule[0].doctorId,
                        date: schedule[0].date,
                    },
                    attributes: ['date', 'timeType', 'doctorId'],
                });

                // ignore duplicate schedule
                let createData = _.differenceWith(schedule, existed, (a, b) => {
                    return a.date === b.date && a.timeType === b.timeType;
                });

                // console.log('existed: ', existed);
                // console.log('createData: ', createData);

                await db.Schedule.bulkCreate(createData);
                resolve({
                    errCode: 0,
                    message: 'Save successfully!',
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

const getScheduleTime = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    message: 'Missing required parameter. Please check again!',
                });
            } else {
                let data = await db.Schedule.findAll({
                    where: {
                        doctorId,
                        date,
                    },
                    attributes: ['date', 'timeType', 'doctorId'],
                    include: [
                        {
                            model: db.Allcode,
                            as: 'timeData',
                            attributes: ['valueEn', 'valueVi'],
                        },
                        {
                            model: db.User,
                            as: 'doctorData',
                            attributes: ['firstName', 'lastName'],
                        },
                    ],
                    raw: true,
                    nest: true,
                });
                if (!data) data = [];
                resolve({
                    errCode: 0,
                    data,
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};
module.exports = {
    getTopDoctor,
    getAllDoctors,
    postInfoDoctor,
    getDoctorById,
    getProfileDoctorById,
    createScheduleTime,
    getScheduleTime,
    getExtraInfoDoctorById,
};
