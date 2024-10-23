const { User, Specialty, Clinic, DoctorInfo } = require('../models');
const { Op } = require('sequelize'); // Dùng để tìm kiếm theo LIKE

const search = async (req, res) => {
    const { q, type, specialty } = req.query;

    let searchResults = [];

    try {
        // Tìm kiếm toàn bộ các thực thể
        if (type === 'all') {
            const doctors = await User.findAll({
                where: {
                    firstName: { [Op.like]: `%${q}%` },
                },
                include: [
                    { model: DoctorInfo, as: 'doctorInfoData', where: { specialtyId: specialty }, required: false },
                ],
            });

            const clinics = await Clinic.findAll({
                where: {
                    name: { [Op.like]: `%${q}%` },
                },
            });

            const specialties = await Specialty.findAll({
                where: {
                    valueVi: { [Op.like]: `%${q}%` },
                },
            });

            searchResults = [...doctors, ...clinics, ...specialties];
        }

        // Tìm kiếm theo loại cụ thể
        if (type === 'doctor') {
            searchResults = await User.findAll({
                where: {
                    firstName: { [Op.like]: `%${q}%` },
                    roleId: 'R2', //R2 là bác sĩ
                },
                include: [
                    { model: DoctorInfo, as: 'doctorInfoData', where: { specialtyId: specialty }, required: false },
                ],
            });
        } else if (type === 'clinic') {
            searchResults = await Clinic.findAll({
                where: {
                    name: { [Op.like]: `%${q}%` },
                },
            });
        } else if (type === 'hospital') {
            searchResults = await Clinic.findAll({
                where: {
                    type: 'hospital',
                    name: { [Op.like]: `%${q}%` },
                },
            });
        } else if (type === 'specialty') {
            searchResults = await Specialty.findAll({
                where: {
                    valueVi: { [Op.like]: `%${q}%` },
                },
            });
        }

        return res.status(200).json({ results: searchResults });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi khi tìm kiếm' });
    }
};

module.exports = {
    search,
};
