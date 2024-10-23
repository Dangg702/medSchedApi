import SpecialtyService from '../services/SpecialtyService';
const { uploadImage } = require('../untils/uploadImage'); // Đường dẫn tới file uploadImage.js
const path = require('path');
const fs = require('fs');

const createSpecialty = async (req, res) => {
    try {
        let data = req.body;
        let imageUrl;
        if (req.file) {
            // Lấy đường dẫn file tạm thời
            const filePath = req.file.path;
            // Upload ảnh lên Cloudinary
            imageUrl = await uploadImage(filePath);
        }
        if (imageUrl) {
            data.image = imageUrl;
        }
        if (!data) {
            return res.status(500).json({
                errCode: 1,
                message: 'Missing specialty information',
            });
        }
        let result = await SpecialtyService.createSpecialty(data);
        return res.status(200).json(result);
    } catch (error) {
        console.log('Error createSpecialty', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};
const editSpecialty = async (req, res) => {
    try {
        let specialtyId = req.query.id;
        let data = req.body;
        if (specialtyId) {
            let imageUrl;
            if (req.file) {
                imageUrl = await uploadImage(req.file.path);
                data.image = imageUrl;
            }
            let response = await SpecialtyService.editSpecialty(specialtyId, data);
            return res.status(200).json(response);
        } else {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter! Please check again!',
            });
        }
    } catch (error) {
        console.log('Error createSpecialty', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};
const deleteSpecialty = async (req, res) => {
    try {
        let id = +req.query.id;
        if (!id) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter! Please check again!',
            });
        }
        let result = await SpecialtyService.deleteSpecialty(id);
        return res.status(200).json(result);
    } catch (error) {
        console.log('Error deleteSpecialty', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};
const getAllSpecialty = async (req, res) => {
    try {
        let name = req.query.name; //All / Name
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
            let specialties = await SpecialtyService.getAllSpecialty(name, page, per_page);
            return res.status(200).json({
                errCode: 0,
                message: 'OK',
                total: specialties.count,
                per_page: per_page,
                page: page,
                total_pages: Math.ceil(specialties.count / per_page),
                data: specialties.rows,
            });
        } else if (name && !page && !per_page) {
            let specialties = await SpecialtyService.getAllSpecialty(name);
            return res.status(200).json({
                errCode: 0,
                message: 'OK',
                data: specialties,
            });
        }
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
    editSpecialty,
    deleteSpecialty,
};
