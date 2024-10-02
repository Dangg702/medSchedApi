import SpecialtyService from '../services/SpecialtyService';

const createSpecialty = async (req, res) => {
    try {
        let data = req.body;
        if (!data) {
            res.status(500).json({
                errCode: 1,
                message: 'Missing specialty information',
            });
        }
        let result = await SpecialtyService.createSpecialty(data);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error createSpecialty', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};
const getAllSpecialty = async (req, res) => {
    try {
        let data = req.query;
        if (!data) {
            res.status(500).json({
                errCode: 1,
                message: 'Missing required information',
            });
        }
        let result = await SpecialtyService.getAllSpecialty(data);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error getAllSpecialty', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const getDoctorsBySpecialtyId = async (req, res) => {
    try {
        let id = req.query.id;
        if (!id) {
            res.status(500).json({
                errCode: 1,
                message: 'Missing required information',
            });
        }
        let result = await SpecialtyService.getDoctorsBySpecialtyId(id);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error getDoctorBySpecialtyId', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

module.exports = {
    createSpecialty,
    getAllSpecialty,
    getDoctorsBySpecialtyId,
};
