import DoctorService from '../services/DoctorService';

const getTopDoctor = async (req, res) => {
    let limit = parseInt(req.query.limit);
    if (!limit) {
        limit = 10;
    }
    try {
        let doctors = await DoctorService.getTopDoctor(limit);
        return res.status(200).json(doctors);
    } catch (error) {
        console.log('Error getTopDoctor: ', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const getAllDoctors = async (req, res) => {
    try {
        let doctors = await DoctorService.getAllDoctors();
        return res.status(200).json(doctors);
    } catch (error) {
        console.log('Error getAllDoctors: ', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const postInfoDoctor = async (req, res) => {
    try {
        let data = req.body;
        if (data) {
            let response = await DoctorService.postInfoDoctor(data);
            return res.status(200).json(response);
        }
    } catch (error) {
        console.log('Error postInfoDoctor: ', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const getDoctorById = async (req, res) => {
    try {
        let doctorId = +req.query.id;
        if (!doctorId) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter',
            });
        }
        let doctorData = await DoctorService.getDoctorById(doctorId);
        return res.status(200).json(doctorData);
    } catch (error) {
        console.log('Error getDoctorById', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const getProfileDoctorById = async (req, res) => {
    try {
        let doctorId = +req.query.id;
        if (!doctorId) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter',
            });
        }
        let doctorData = await DoctorService.getProfileDoctorById(doctorId);
        return res.status(200).json(doctorData);
    } catch (error) {
        console.log('Error getProfileDoctorById', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const getExtraInfoDoctorById = async (req, res) => {
    try {
        let doctorId = +req.query.id;
        if (!doctorId) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter',
            });
        }
        let doctorData = await DoctorService.getExtraInfoDoctorById(doctorId);
        return res.status(200).json(doctorData);
    } catch (error) {
        console.log('Error getExtraInfoDoctorById', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const createScheduleTime = async (req, res) => {
    try {
        let data = req.body;
        if (data) {
            let response = await DoctorService.createScheduleTime(data);
            res.status(200).json(response);
        }
    } catch (error) {
        console.log('Error createScheduleTime: ', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const getScheduleTime = async (req, res) => {
    try {
        let { date } = req.query;
        if (!date) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter: date',
            });
        } else {
            let data = await DoctorService.getScheduleTime(date);
            return res.status(200).json(data);
        }
    } catch (err) {
        console.log('Error getScheduleTime: ', err);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const getListAppointmentPatients = async (req, res) => {
    try {
        let doctorId = req.query.doctorId;
        let date = req.query.date;
        if (!doctorId || !date) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter',
            });
        } else {
            let data = await DoctorService.getListAppointmentPatients(doctorId, date);
            return res.status(200).json(data);
        }
    } catch (err) {
        console.log('Error getListAppointmentPatients: ', err);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const confirmAppointment = async (req, res) => {
    try {
        let data = req.body;
        if (data) {
            let response = await DoctorService.confirmAppointment(data);
            return res.status(200).json(response);
        }
    } catch (error) {
        console.log('Error confirmAppointment: ', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        let data = req.body;
        if (data) {
            let response = await DoctorService.cancelAppointment(data);
            return res.status(200).json(response);
        }
    } catch (error) {
        console.log('Error cancelAppointment: ', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const getAllSchedule = async (req, res) => {
    try {
        let date = req.query.date;
        let page = parseInt(req.query.page);
        let per_page = parseInt(req.query.per_page);
        if (!date || !page || !per_page) {
            return res.status(400).json({
                errCode: 1,
                message: 'Missing required parameter! Please check again!',
            });
        }
        if (page && per_page) {
            if (isNaN(page) || isNaN(per_page) || page <= 0 || per_page <= 0) {
                return res.status(400).json({
                    errCode: 2,
                    message: 'Invalid page or per_page parameter',
                });
            }

            let schedule = await DoctorService.getAllSchedule(date, page, per_page);
            return res.status(200).json({
                errCode: 0,
                message: 'OK',
                total: schedule.count,
                per_page: per_page,
                page: page,
                total_pages: Math.ceil(schedule.count / per_page),
                data: schedule.rows,
            });
        } else {
            // Trường hợp chỉ có 'date' mà không có 'page' và 'per_page'
            let schedule = await DoctorService.getAllSchedule(date);
            return res.status(200).json({
                errCode: 0,
                message: 'OK',
                data: schedule,
            });
        }
    } catch (err) {
        console.log('Error getAllSchedule: ', err);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const deleteSchedule = async (req, res) => {
    try {
        let id = req.query.id;
        if (!id) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required data',
            });
        } else {
            let data = await DoctorService.deleteSchedule(id);
            return res.status(200).json(data);
        }
    } catch (err) {
        console.log('Error deleteSchedule: ', err);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
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
