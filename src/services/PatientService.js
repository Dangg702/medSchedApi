import db from '../models';
import { sendEmailCreateBooking } from './EmailService';

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
            let isBooking = await db.Booking.findAll({
                where: {
                    doctorId: data.doctorId,
                    date: data.date,
                    statusId: { [db.Sequelize.Op.ne]: 'S3' },
                },
            });
            if (isBooking.length > 0) {
                return resolve({
                    errCode: 3,
                    message: 'Appointment limit has been reached',
                });
            }
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
            };
            let sendEmail = await sendEmailCreateBooking(emailData);

            await db.Booking.create({
                statusId: 'S1',
                doctorId: data.doctorId,
                patientId: data.patientId,
                date: data.date,
                timeType: data.timeType,
                reason: data.reason,
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

module.exports = { bookingAppointment };
