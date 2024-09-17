const nodemailer = require('nodemailer');
const dotenvFlow = require('dotenv-flow');
dotenvFlow.config();

const sendEmailCreateBooking = async (data) => {
    let clientMail = data.patientEmail;
    console.log(data);

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_ACCOUNT,
            pass: process.env.MAIL_PASSWORD,
        },
    });
    let info = await transporter.sendMail({
        from: process.env.MAIL_ACCOUNT,
        to: clientMail,
        subject: data.language === 'vi' ? 'Xác nhận đặt khám tại MedSched' : 'Confirmed booking at MedSched',
        html: createHtmlMail(data),
    });
};

const createHtmlMail = (data) => {
    if (data.language === 'vi') {
        return `
            <p>Gửi ${data?.patientName},</p>
            <p>Bạn đã đặt lịch khám với Bác sĩ <strong>${data?.doctorName}</strong>. </p>
            <p><strong>Giờ khám:</strong> ${data?.timeVal} </p>
            <p><strong>Ngày:</strong> ${data?.date} </p>
            <p>Nếu thông tin trên là đúng, vui lòng nhấn vào đường dẫn bên dưới để xác nhận và hoàn tất thủ tục.</p>
            <a href="${process.env.CLIENT_URL}/confirm-booking/${data?.bookingId}" target="_blank">Xác nhận</a>

            <p>Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi.</p>
        `;
    } else if (data.language === 'en') {
        return `
            <p>Dear ${data?.patientName},</p>
            <p>You have booked an appointment with Dr. <strong>${data?.doctorName}</strong>. </p>
            <p><strong>Time:</strong> ${data?.timeVal} </p>
            <p><strong>Date:</strong> ${data?.date} </p>
            <p>If the information above is correct, please click the link below to confirm and complete the procedure.</p>
            <a href="${process.env.CLIENT_URL}/confirm-booking/${data?.bookingId}" target="_blank">Confirm</a>

            <p>Thank you for choosing our service.</p>
        `;
    }
};

const sendOTPEmail = async (clientEmail, otpData) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_ACCOUNT,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    // Gửi email với đối tượng vận chuyển đã được xác định
    let info = await transporter.sendMail({
        from: process.env.MAIL_ACCOUNT,
        to: clientEmail,
        subject: 'OTP Code',
        text: 'Xin chào,',
        html: `
      <p><u>${otpData?.otp}</u> la ma xac thuc OPT cua quy khach. Ma co hieu luc trong 5 phut</p>
    `,
    });
};

module.exports = { sendEmailCreateBooking, sendOTPEmail };
