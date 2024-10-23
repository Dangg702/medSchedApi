import { User, DoctorInfo, Specialty, Clinic } from '../models';
import { Op } from 'sequelize';

const search = async (req, res) => {
    const { q, type } = req.query;
    console.log('Search query:', q);
    console.log('Search type:', type);
    
    try {
        let results = [];
        
        // Tìm kiếm bác sĩ theo tên
        if (type && (type.trim() === 'doctor' || type.trim() === 'all')) {
            const doctors = await User.findAll({
                where: {
                    [Op.or]: [
                        { firstName: { [Op.like]: `%${q}%` } },
                        { lastName: { [Op.like]: `%${q}%` } },
                    ]
                }
            });

            if (doctors.length > 0) {
                const doctorIds = doctors.map(doctor => doctor.id);
                const doctorInfoList = await DoctorInfo.findAll({
                    where: {
                        doctorId: {
                            [Op.in]: doctorIds
                        }
                    },
                    include: [
                        { model: Clinic, as: 'clinicData' },
                        { model: Specialty, as: 'specialtyData' },
                        { model: User, as: 'doctorInfoData' },
                    ],
                    raw: true // Thêm raw: true nếu bạn chỉ cần dữ liệu thô
                });
                results = results.concat(doctorInfoList);
            }
            console.log('Doctors found:', doctors);
        }

        // Tìm kiếm bệnh viện theo tên
        if (type && (type.trim() === 'clinic' || type.trim() === 'all')) {
            const clinics = await Clinic.findAll({
                where: {
                    name: { [Op.like]: `%${q}%` }
                },
                raw: true // Thêm raw: true nếu bạn chỉ cần dữ liệu thô
            });
            
            if (clinics.length > 0) {
                results = results.concat(clinics);
            }
        }

        // Tìm kiếm triệu chứng theo tên trong bảng DoctorInfo hoặc các mô hình liên quan
        if (type && (type.trim() === 'symptom' || type.trim() === 'all')) {
            const symptoms = await DoctorInfo.findAll({
                where: {
                    note: { [Op.like]: `%${q}%` }
                },
                include: [
                    { model: User, as: 'doctorInfoData' },
                    { model: Clinic, as: 'clinicData' },
                    { model: Specialty, as: 'specialtyData' },
                ],
                raw: true // Thêm raw: true nếu bạn chỉ cần dữ liệu thô
            });

            if (symptoms.length > 0) {
                results = results.concat(symptoms);
            }
        }

        console.log('Final results:', results);
        return res.json(results);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving data' });
    }
};

export default { search };
