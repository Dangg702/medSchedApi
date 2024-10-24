import db from '../models';
import _, { includes } from 'lodash';
import moment from 'moment';
import dotenvFlow from 'dotenv-flow';
import { Op, fn, col } from 'sequelize';
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
                    {
                        model: db.DoctorInfo,
                        as: 'doctorInfoData',
                        attributes: ['specialtyId'],
                        include: [{ model: db.Specialty, as: 'specialtyData', attributes: ['valueEn', 'valueVi'] }],
                    },
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
                !data.action ||
                !data.selectedPrice ||
                !data.selectedCity ||
                !data.selectedPayment ||
                !data.selectedSpecialty ||
                !data.selectedClinic
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
                        clinicId: +data.selectedClinic,
                        specialtyId: +data.selectedSpecialty,
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
                            clinicId: +data.selectedClinic,
                            specialtyId: +data.selectedSpecialty,
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
                            specialtyId: data.selectedSpecialty,
                            clinicId: data.selectedClinic,
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
                        specialtyId: data.selectedSpecialty,
                        clinicId: data.selectedClinic,
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
                            { model: db.Clinic, as: 'clinicData', attributes: ['name', 'address'] },
                            { model: db.Specialty, as: 'specialtyData', attributes: ['valueEn', 'valueVi'] },
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
                where: { doctorId: +doctorId },
                attributes: {
                    exclude: ['id', 'doctorId', 'createdAt', 'updatedAt'],
                },
                include: [
                    { model: db.Allcode, as: 'priceData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'paymentData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'provinceData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Clinic, as: 'clinicData', attributes: ['name', 'address'] },
                    { model: db.Specialty, as: 'specialtyData', attributes: ['valueEn', 'valueVi'] },
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

const getScheduleTime = (date) => {
    return new Promise(async (resolve, reject) => {
        console.log(date)

        try {
            let results = [];

            // Kiểm tra nếu có ngày tìm kiếm
            if (date) {
                const checkDate = moment(date, 'YYYY-MM-DD');
                const formattedDate = moment(date).format('YYYY-MM-DD');
                const currentTime = moment(); // Thời gian hiện tại
                //console.log('formattedDate', formattedDate);
                //console.log('currentTime', currentTime);
                
                if (checkDate.isBefore(currentTime, 'day')) {
                    return resolve({
                        errCode: 0,
                        data: []
                    });
                }
                // Tìm các lịch khám theo ngày
                const schedules = await db.Schedule.findAll({
                    where: {
                        // Chuyển đổi định dạng dd/mm/yyyy sang YYYY-MM-DD để so sánh
                        date: {
                            [Op.eq]: moment(formattedDate, 'YYYY-MM-DD').format('DD/MM/YYYY')
                        }
                    },
                    include: [
                        {
                            model: db.User,
                            as: 'doctorData',
                            attributes: ['firstName', 'lastName'], // Thông tin bác sĩ
                        },
                        {
                            model: db.Allcode,
                            as: 'timeData',
                            attributes: ['valueVi'], // Giá trị giờ khám
                        },
                        {
                            model: db.DoctorInfo,
                            as: 'doctorInfoData',
                            attributes: ['priceId', 'clinicId', 'specialtyId'], // Thông tin bổ sung về bác sĩ
                        },
                    ],
                    raw: true,
                    nest: true,
                });

                // Kiểm tra nếu ngày nhập là ngày hiện tại
                if (checkDate.isSame(currentTime, 'day')) {
                    // Lọc lịch khám dựa trên giờ bắt đầu chỉ khi ngày nhập là hiện tại
                    results = schedules.filter(schedule => {
                        const [startTime] = schedule.timeData.valueVi.split(' - ');
                        const scheduleStartTime = moment(startTime, 'HH:mm');
                        return scheduleStartTime.isAfter(moment()); // Chỉ lấy lịch sau giờ hiện tại
                    }).map(schedule => ({
                        date: schedule.date,
                        time: schedule.timeData.valueVi,
                        doctorId: schedule.doctorId,
                        doctorName: `${schedule.doctorData.firstName} ${schedule.doctorData.lastName}`,
                        priceId: schedule.doctorInfoData.priceId,
                        clinicId: schedule.doctorInfoData.clinicId,
                        specialtyId: schedule.doctorInfoData.specialtyId,
                    }));
                } else {
                    // Nếu ngày nhập sau ngày hiện tại, trả về tất cả lịch
                    results = schedules.map(schedule => ({
                        date: schedule.date,
                        time: schedule.timeData.valueVi,
                        doctorId: schedule.doctorId,
                        doctorName: `${schedule.doctorData.firstName} ${schedule.doctorData.lastName}`,
                        priceId: schedule.doctorInfoData.priceId,
                        clinicId: schedule.doctorInfoData.clinicId,
                        specialtyId: schedule.doctorInfoData.specialtyId,
                    }));
                }
            }
            let data = results;
            if (!data) data = [];

            resolve({
                errCode: 0,
                data,
            });
        } catch (error) {
            console.error('Error getScheduleTime: ', error);
            reject({
                errCode: 1,
                errMessage: 'Error from server',
            });
        }
    });
};



const getListAppointmentPatients = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Booking.findAll({
                where: {
                    statusId: 'S2',
                    doctorId,
                    date,
                },
                attributes: ['patientId', 'doctorId', 'statusId', 'date', [col('timeType'), 'time']],
                include: [
                    {
                        model: db.Allcode,
                        as: 'statusData',
                        attributes: ['valueEn', 'valueVi'],
                    },
                    {
                        model: db.Allcode,
                        as: 'timeBookingData',
                        attributes: ['valueEn', 'valueVi'],
                    },
                    {
                        model: db.User,
                        as: 'patientData',
                        attributes: ['firstName', 'lastName', 'gender', 'email', 'address', 'phoneNumber'],
                        include: [{ model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] }],
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
        } catch (error) {
            reject(error);
        }
    });
};

const confirmAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.doctorId || !data.patientId || !data.date || !data.timeType) {
                resolve({
                    errCode: 1,
                    message: 'Missing required parameter. Please check again!',
                });
            } else {
                const [updated] = await db.Booking.update(
                    {
                        statusId: 'S3',
                    },
                    {
                        where: {
                            patientId: data.patientId,
                            doctorId: data.doctorId,
                            date: data.date,
                            timeType: data.timeType,
                            statusId: 'S2',
                        },
                    },
                );

                if (updated) {
                    resolve({
                        errCode: 0,
                        message: 'Confirm appointment successfully!',
                    });
                } else {
                    resolve({
                        errCode: 2,
                        message: 'Appointment not found or already confirmed.',
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

const cancelAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.doctorId || !data.patientId || !data.date || !data.timeType) {
                resolve({
                    errCode: 1,
                    message: 'Missing required parameter. Please check again!',
                });
            } else {
                const [updated] = await db.Booking.update(
                    {
                        statusId: 'S4',
                    },
                    {
                        where: {
                            patientId: data.patientId,
                            doctorId: data.doctorId,
                            date: data.date,
                            timeType: data.timeType,
                            statusId: 'S2',
                        },
                    },
                );

                if (updated) {
                    resolve({
                        errCode: 0,
                        message: 'Cancel appointment successfully!',
                    });
                } else {
                    resolve({
                        errCode: 2,
                        message: 'Appointment not found or already cancel.',
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

const getAllSchedule = (date, page, per_page) => {
    return new Promise(async (resolve, reject) => {
        try {
            let scheduleList = {};
            const offset = (page - 1) * per_page;

            const queryOptions = {
                attributes: {
                    exclude: ['currentNumber', 'maxNumber', 'createdAt', 'updatedAt'],
                },
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
                order: [['id', 'DESC']],
                raw: true,
                nest: true,
            };

            if (date === 'ALL') {
                if (page && per_page) {
                    scheduleList = await db.Schedule.findAndCountAll({
                        ...queryOptions,
                        offset,
                        limit: per_page,
                    });
                    resolve({
                        count: scheduleList.count,
                        rows: scheduleList.rows,
                    });
                } else {
                    scheduleList = await db.Schedule.findAll(queryOptions);
                    resolve(scheduleList);
                }
            } else if (date) {
                scheduleList = await db.Schedule.findAndCountAll({
                    where: { date },
                    ...queryOptions,
                    offset,
                    limit: per_page,
                });
                resolve(scheduleList);
            }
        } catch (error) {
            reject(error);
        }
    });
};

const deleteSchedule = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    message: 'Missing required parameter. Please check again!',
                });
            } else {
                const deleted = await db.Schedule.destroy({
                    where: {
                        id: +id,
                    },
                });

                if (deleted) {
                    resolve({
                        errCode: 0,
                        message: 'Delete schedule successfully!',
                    });
                } else {
                    resolve({
                        errCode: 2,
                        message: 'Schedule not found.',
                    });
                }
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
    getListAppointmentPatients,
    confirmAppointment,
    cancelAppointment,
    getAllSchedule,
    deleteSchedule,
};
