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

module.exports = {
    createClinic,
    getAllClinic,
    getClinicDetailById,
};
