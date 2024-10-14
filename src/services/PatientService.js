import db from '../models';
import dotenvFlow from 'dotenv-flow';
import { v4 as uuidv4 } from 'uuid';
import { sendEmailCreateBooking } from './EmailService';

dotenvFlow.config();
const clientURL = process.env.CLIENT_URL;

let buildUrlEmail = (token, date) => {
    return `${clientURL}/booking-verify?token=${token}&date=${date}`;
};

let bookingAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.doctorId || !data.timeType || !data.date) {
                return resolve({
                    errCode: 1,
                    message: 'Missing required information',
                });
            }
            let patientId = data.patientId;

            let patient = await db.User.findOne({
                where: { id: patientId, roleId: 'R3' },
            });
            if (!patient) {
                return resolve({
                    errCode: 2,
                    message: 'Patient not found',
                });
            }
            let isBooking = await db.Booking.findOne({
                where: {
                    patientId: patientId,
                    doctorId: data.doctorId,
                    date: data.date,
                    statusId: { [db.Sequelize.Op.ne]: 'S3' },
                },
            });
            if (isBooking) {
                return resolve({
                    errCode: 3,
                    message: 'Appointment limit has been reached',
                });
            }
            let token = uuidv4();

            let emailData = {
                patientName:
                    data.language === 'vi'
                        ? patient.firstName + ' ' + patient.lastName
                        : patient.lastName + ' ' + patient.firstName,
                patientEmail: patient.email,
                doctorName: data.doctorName,
                timeVal: data.timeVal,
                date: data.date,
                language: data.language,
                verifyUrl: buildUrlEmail(token, data.date),
            };
            await sendEmailCreateBooking(emailData);

            await db.Booking.create({
                statusId: 'S1',
                doctorId: data.doctorId,
                patientId: data.patientId,
                date: data.date,
                timeType: data.timeType,
                reason: data.reason,
                token,
            });

            return resolve({
                errCode: 0,
                message: 'Booking successfully. Please check your mail!',
            });
        } catch (error) {
            return reject(error);
        }
    });
};

let verifyBookingAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.date) {
                return resolve({
                    errCode: 1,
                    message: 'Missing required information',
                });
            }
            let booking = await db.Booking.findOne({
                where: { token: data.token, date: data.date, statusId: 'S1' },
            });
            if (!booking) {
                return resolve({
                    errCode: 2,
                    message: 'Booking is verified or Booking is not found',
                });
            }
            let dateBooking = new Date(booking.date); //18/09/2024
            if (isNaN(dateBooking.getTime())) {
                let parts = booking.date.split('/');
                dateBooking = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }
            let currentDate = new Date();
            // console.log('test date', dateBooking, currentDate);
            // console.log('check', dateBooking.getTime() - currentDate.getTime());
            if (dateBooking.getTime() - currentDate.getTime() < 0) {
                return resolve({
                    errCode: 3,
                    message: 'Booking time has expired',
                });
            }
            await db.Booking.update(
                { statusId: 'S2' },
                {
                    where: { token: data.token, date: data.date },
                },
            );
            return resolve({
                errCode: 0,
                message: 'Verify successfully',
            });
        } catch (error) {
            return reject(error);
        }
    });
};

let getListAppointmentOfPatient = async (patientId) => {
    try {
        if (!patientId) {
            return {
                errCode: 1,
                message: 'Missing required information',
            };
        }
        let data = await db.Booking.findAll({
            where: { patientId, statusId: 'S2' },
            attribute: ['date', 'timeType', 'statusId'],
            include: [
                {
                    model: db.User,
                    as: 'doctorBookingData',
                    attribute: ['firstName', 'lastName'],
                    include: [
                        {
                            model: db.DoctorInfo,
                            as: 'doctorInfoData',
                            include: [
                                { model: db.Clinic, as: 'clinicData', attribute: ['address', 'name'] },
                                { model: db.Specialty, as: 'specialtyData', attribute: ['valueVi', 'valueEn'] },
                            ],
                        },
                    ],
                },
                {
                    model: db.Allcode,
                    as: 'timeBookingData',
                    attribute: ['valueVi', 'valueEn'],
                },
            ],
            raw: true,
            nest: true,
        });
        return {
            errCode: 0,
            message: 'OK',
            data,
        };
    } catch (error) {
        return {
            errCode: -1,
            message: error.message,
        };
    }
};

module.exports = { bookingAppointment, verifyBookingAppointment, getListAppointmentOfPatient };
