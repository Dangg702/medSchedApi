import ClinicService from '../services/ClinicService';

const createClinic = async (req, res) => {
    try {
        let data = req.body;
        if (!data) {
            res.status(500).json({
                errCode: 1,
                message: 'Missing clinic information',
            });
        }
        let result = await ClinicService.createClinic(data);
        console.log('result', result);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error createClinic', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};
const getAllClinic = async (req, res) => {
    try {
        let result = await ClinicService.getAllClinic();
        res.status(200).json(result);
    } catch (error) {
        console.log('Error getAllClinic', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const getClinicDetailById = async (req, res) => {
    try {
        let clinicId = req.query.id;
        if (!clinicId) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter',
            });
        }
        let result = await ClinicService.getClinicDetailById(clinicId);
        return res.status(200).json(result);
    } catch (error) {
        console.log('Error getClinicDetailById', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const getClinics = async (req, res) => {
    try {
        let name = req.query.name;
        let page = parseInt(req.query.page);
        let per_page = parseInt(req.query.per_page);

        if (!name || !page || !per_page) {
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

            let clinic = await ClinicService.getClinics(name, page, per_page);
            return res.status(200).json({
                errCode: 0,
                message: 'OK',
                total: clinic.count,
                per_page: per_page,
                page: page,
                total_pages: Math.ceil(clinic.count / per_page),
                data: clinic.rows,
            });
        } else {
            let clinic = await ClinicService.getClinics(name);
            return res.status(200).json({
                errCode: 0,
                message: 'OK',
                data: clinic,
            });
        }
    } catch (err) {
        console.log('Error getClinics: ', err);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

module.exports = {
    createClinic,
    getAllClinic,
    getClinicDetailById,
    getClinics,
};
