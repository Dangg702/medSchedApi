import db from '../models';

const createSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.valueVi || !data.valueEn) {
                return resolve({
                    errCode: 1,
                    message: 'Missing required information',
                });
            }
            const specialty = await db.Specialty.findOrCreate({
                where: { valueVi: data.valueVi, valueEn: data.valueEn },
                defaults: {
                    valueVi: data.valueVi,
                    valueEn: data.valueEn,
                    image: data.image || '',
                },
            });
            if (!specialty) {
                return resolve({
                    errCode: 2,
                    message: 'Create specialty failed',
                });
            }
            return resolve({
                errCode: 0,
                message: 'Create specialty successfully!',
            });
        } catch (error) {
            return reject(error);
        }
    });
};

const editSpecialty = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let specialty = await db.Specialty.findOne({
                where: { id: id },
            });
            if (specialty) {
                await db.Specialty.update(
                    {
                        valueVi: data.valueVi && data.valueVi.trim(),
                        valueEn: data.valueEn && data.valueEn.trim(),
                        image: data.image && data.image,
                    },
                    {
                        where: {
                            id: id,
                        },
                    },
                );
                resolve({
                    errCode: 0,
                    message: 'OK',
                });
            } else {
                resolve({
                    errCode: 2,
                    message: 'Specialty is not exist',
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

const deleteSpecialty = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                return resolve({
                    errCode: 1,
                    message: 'Missing required information',
                });
            }
            const specialty = await db.Specialty.findOne({
                where: { id: id },
            });
            if (!specialty) {
                return resolve({
                    errCode: 2,
                    message: 'Specialty not found',
                });
            }
            await db.Specialty.destroy({
                where: { id: id },
            });
            return resolve({
                errCode: 0,
                message: 'Delete specialty successfully',
            });
        } catch (error) {
            return reject(error);
        }
    });
};

const getAllSpecialty = (name, page, per_page) => {
    return new Promise(async (resolve, reject) => {
        try {
            let specialties = {};
            const offset = (page - 1) * per_page;

            if (name && page && per_page && name === 'ALL') {
                specialties = await db.Specialty.findAndCountAll({
                    offset,
                    limit: per_page,
                    order: [['id', 'DESC']],
                });
            }

            if (name && !page && !per_page && name === 'ALL') {
                specialties = await db.Specialty.findAll();
            }

            if (name && name !== 'ALL') {
                specialties = await db.Specialty.findOne({
                    where: {
                        valueVi: name,
                    },
                });
            }
            resolve(specialties);
        } catch (error) {
            return reject(error);
        }
    });
};

const getDoctorsBySpecialtyId = async (id) => {
    try {
        if (!id) {
            return {
                errCode: 1,
                message: 'Missing required information',
            };
        }

        const doctors = await db.DoctorInfo.findAll({
            where: { specialtyId: id },
        });

        if (!doctors || doctors.length === 0) {
            return {
                errCode: 2,
                message: 'Cannot get doctor by specialty id',
            };
        }

        return {
            errCode: 0,
            message: 'Get doctor by specialty id successfully',
            data: doctors,
        };
    } catch (error) {
        return {
            errCode: 500,
            message: 'An error occurred while fetching doctors',
            error: error.message,
        };
    }
};

// const searchAllBySpecialty = async (specialty, keyword) => {
//     // Thực hiện tìm kiếm tất cả các bác sĩ, bệnh viện, phòng khám theo chuyên khoa và từ khóa
//     // Ví dụ:
//     return await db.AllInfo.findAll({
//         where: {
//             specialtyId: specialty,
//             name: { [Op.like]: `%${keyword}%` },
//         },
//     });
// };

// const searchDoctorsBySpecialty = async (specialty, keyword) => {
//     return await db.DoctorInfo.findAll({
//         where: {
//             specialtyId: specialty,
//             name: { [Op.like]: `%${keyword}%` },
//         },
//     });
// };

// const searchHospitalsBySpecialty = async (specialty, keyword) => {
//     return await db.HospitalInfo.findAll({
//         where: {
//             specialtyId: specialty,
//             name: { [Op.like]: `%${keyword}%` },
//         },
//     });
// };

// const searchClinicsBySpecialty = async (specialty, keyword) => {
//     return await db.ClinicInfo.findAll({
//         where: {
//             specialtyId: specialty,
//             name: { [Op.like]: `%${keyword}%` },
//         },
//     });
// };

// const searchByKeyword = async (keyword, type) => {
//     let results = [];
//     switch (type) {
//         case 'all':
//             results = await db.AllInfo.findAll({
//                 where: {
//                     name: { [Op.like]: `%${keyword}%` },
//                 },
//             });
//             break;
//         case 'doctor':
//             results = await db.DoctorInfo.findAll({
//                 where: {
//                     name: { [Op.like]: `%${keyword}%` },
//                 },
//             });
//             break;
//         case 'hospital':
//             results = await db.HospitalInfo.findAll({
//                 where: {
//                     name: { [Op.like]: `%${keyword}%` },
//                 },
//             });
//             break;
//         case 'clinic':
//             results = await db.ClinicInfo.findAll({
//                 where: {
//                     name: { [Op.like]: `%${keyword}%` },
//                 },
//             });
//             break;
//         default:
//             break;
//     }
//     return results;
// };

// const search = async (query) => {
//     const { q = '', type = 'all', specialty } = query;

//     // Xử lý điều kiện tìm kiếm theo chuyên khoa
//     if (specialty) {
//         switch (type) {
//             case 'all':
//                 // Tìm kiếm tất cả bác sĩ, bệnh viện, phòng khám theo chuyên khoa
//                 const allResults = await searchAllBySpecialty(specialty, q);
//                 return {
//                     errCode: 0,
//                     message: 'Search all results by specialty',
//                     data: allResults,
//                 };

//             case 'doctor':
//                 const doctors = await searchDoctorsBySpecialty(specialty, q);
//                 return {
//                     errCode: 0,
//                     message: 'Search doctors by specialty',
//                     data: doctors,
//                 };

//             case 'hospital':
//                 const hospitals = await searchHospitalsBySpecialty(specialty, q);
//                 return {
//                     errCode: 0,
//                     message: 'Search hospitals by specialty',
//                     data: hospitals,
//                 };

//             case 'clinic':
//                 const clinics = await searchClinicsBySpecialty(specialty, q);
//                 return {
//                     errCode: 0,
//                     message: 'Search clinics by specialty',
//                     data: clinics,
//                 };

//             default:
//                 return {
//                     errCode: 1,
//                     message: 'Invalid search type',
//                 };
//         }
//     }
//     // Xử lý điều kiện tìm kiếm theo triệu chứng, bác sĩ, hoặc bệnh viện
//     else if (q) {
//         const searchResults = await searchByKeyword(q, type);
//         return {
//             errCode: 0,
//             message: 'Search results by keyword',
//             data: searchResults,
//         };
//     } else {
//         return {
//             errCode: 1,
//             message: 'Missing search query or specialty',
//         };
//     }
// };

module.exports = { createSpecialty, getAllSpecialty, getDoctorsBySpecialtyId, editSpecialty, deleteSpecialty };
