import PatientService from '../services/PatientService';

const bookingAppointment = async (req, res) => {
    try {
        let booking = req.body;
        if (!booking) {
            res.status(500).json({
                errCode: 1,
                message: 'Missing booking information',
            });
        }
        let result = await PatientService.bookingAppointment(booking);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error bookingAppointment', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const verifyBookingAppointment = async (req, res) => {
    try {
        let data = req.body;
        if (!data) {
            res.status(500).json({
                errCode: 1,
                message: 'Missing booking information',
            });
        }
        let result = await PatientService.verifyBookingAppointment(data);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error verifyBookingAppointment', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const getListAppointmentOfPatient = async (req, res) => {
    try {
        let patientId = req.query.id;
        if (!patientId) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter. Please check again!',
            });
        }
        let data = await PatientService.getListAppointmentOfPatient(patientId);
        return res.status(200).json(data);
    } catch (error) {
        console.log('Error getListAppointmentOfPatient: ', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

module.exports = {
    bookingAppointment,
    verifyBookingAppointment,
    getListAppointmentOfPatient,
};
