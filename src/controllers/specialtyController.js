import SpecialtyService from '../services/SpecialtyService';
const { uploadImage } = require('../untils/uploadImage'); // Đường dẫn tới file uploadImage.js
const path = require('path');
const fs = require('fs');
const createSpecialty = async (req, res) => {
    try {
        let data = req.body;
        let imageUrl;

        // Kiểm tra xem có file ảnh không
        if (req.file) {
            // Lấy đường dẫn file tạm thời
            const filePath = req.file.path;

            // Upload ảnh lên Cloudinary
            imageUrl = await uploadImage(filePath);
        }

        // Nếu có imageUrl thì thêm vào data
        if (imageUrl) {
            data.image = imageUrl;
        }

        // Kiểm tra xem dữ liệu có tồn tại không
        if (!data) {
            return res.status(500).json({
                errCode: 1,
                message: 'Missing specialty information',
            });
        }

        // Tạo specialty mới
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
