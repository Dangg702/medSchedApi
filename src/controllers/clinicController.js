import ClinicService from '../services/ClinicService';
import { uploadImage } from '../untils/uploadImage';

const createClinic = async (req, res) => {
    try {
        let imageUrl;
        if (req.file) {
            imageUrl = await uploadImage(req.file.path);
        }
        const clinicData = {
            type: req.body.type,
            name: req.body.name,
            address: req.body.address,
            description: req.body.description || '',
            contentMarkdown: req.body.contentMarkdown,
            contentHtml: req.body.contentHtml,
            image: imageUrl || '',
        };
        console.log('clinicData', clinicData);
        let result = await ClinicService.createClinic(clinicData);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error createClinic', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const updateClinic = async (req, res) => {
    let clinicId = req.query.id;

    try {
        if (clinicId) {
            let imageUrl;
            if (req.file) {
                imageUrl = await uploadImage(req.file.path);
                req.body.image = imageUrl;
            }

            let response = await ClinicService.updateClinic(clinicId, req.body);
            return res.status(200).json(response);
        } else {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter! Please check again!',
            });
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật bệnh viện:', error);
        return res.status(500).json({ error: 'Lỗi khi cập nhật bệnh viện' });
    }
};

const deleteClinic = async (req, res) => {
    let clinicId = req.query.id;
    if (clinicId) {
        let response = await ClinicService.deleteClinic(clinicId);
        return res.status(200).json(response);
    } else {
        return res.status(200).json({
            errCode: 1,
            message: 'Missing required parameter! Please check again!',
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
        let name = req.query.name; //All / Id
        let page = parseInt(req.query.page);
        let per_page = parseInt(req.query.per_page);

        if (!name) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter! Please check again!',
                data: [],
            });
        } else {
        }
        if (name && page && per_page) {
            let clinics = await ClinicService.getClinics(name, page, per_page);
            return res.status(200).json({
                errCode: 0,
                message: 'OK',
                total: clinics.count,
                per_page: per_page,
                page: page,
                total_pages: Math.ceil(clinics.count / per_page),
                data: clinics.rows,
            });
        } else if (name && !page && !per_page) {
            let clinics = await ClinicService.getClinics(name);
            return res.status(200).json({
                errCode: 0,
                message: 'OK',
                data: clinics,
            });
        }
    } catch (error) {
        console.log('Error getClinics', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

module.exports = {
    createClinic,
    updateClinic,
    deleteClinic,
    getAllClinic,
    getClinicDetailById,
    getClinics,
};
