import db from '../models';

const createClinic = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.type || !data.name || !data.address || !data.contentMarkdown || !data.contentHtml) {
                return resolve({
                    errCode: 1,
                    message: 'Missing required information',
                });
            }
            const [clinic, created] = await db.Clinic.findOrCreate({
                where: { name: data.name },
                defaults: {
                    name: data.name,
                    type: data.type,
                    address: data.address,
                    contentMarkdown: data.contentMarkdown,
                    contentHtml: data.contentHtml,
                    image: data.image || '',
                    description: data.description || '',
                },
            });
            if (!created) {
                return resolve({
                    errCode: 2,
                    message: 'Clinic with this name already exists',
                });
            }
            return resolve({
                errCode: 0,
                message: 'Clinic created successfully!',
                data: clinic,
            });
        } catch (error) {
            return reject(error);
        }
    });
};

let updateClinic = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let clinic = await db.Clinic.findOne({
                where: { id: id },
            });
            if (clinic) {
                // if (data.name) {
                //     let clinicExist = await db.Clinic.findOne({
                //         where: { name: data.name },
                //     });
                //     if (clinicExist && clinicExist.id !== id) {
                //         return resolve({
                //             errCode: 2,
                //             message: 'Clinic name is already in use',
                //         });
                //     }
                // }
                await db.Clinic.update(
                    {
                        name: data.name && data.name.trim(),
                        type: data.type && data.type.trim(),
                        address: data.address && data.address.trim(),
                        contentMarkdown: data.contentMarkdown && data.contentMarkdown.trim(),
                        contentHtml: data.contentHtml && data.contentHtml,
                        description: data.description && data.description,
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
                    message: 'Clinic is not exist',
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

let deleteClinic = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let status = await db.Clinic.destroy({
                where: {
                    id: id,
                },
            });
            if (status) {
                resolve({
                    errCode: 0,
                    message: 'OK',
                });
            } else {
                resolve({
                    errCode: 2,
                    message: 'Clinic is not exist!',
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

const getAllClinic = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let allClinic = await db.Clinic.findAll();
            if (!allClinic) {
                return resolve({
                    errCode: 1,
                    message: 'Cannot get all clinic',
                });
            }
            return resolve({
                errCode: 0,
                message: 'Get all clinic successfully',
                data: allClinic,
            });
        } catch (error) {
            return reject(error);
        }
    });
};

const getClinicDetailById = (clinicId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let clinic = await db.Clinic.findOne({
                where: { id: clinicId },
            });
            if (!clinic) {
                return resolve({
                    errCode: 1,
                    message: 'Cannot get clinic detail',
                });
            }
            return resolve({
                errCode: 0,
                message: 'Get clinic detail successfully',
                data: clinic,
            });
        } catch (error) {
            return reject(error);
        }
    });
};

const getClinics = (name, page, per_page) => {
    return new Promise(async (resolve, reject) => {
        try {
            let clinics = {};
            const offset = (page - 1) * per_page;

            if (name && page && per_page && name === 'ALL') {
                clinics = await db.Clinic.findAndCountAll({
                    offset,
                    limit: per_page,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt'],
                    },
                    order: [['id', 'DESC']],
                });
            }

            if (name && !page && !per_page && name === 'ALL') {
                clinics = await db.Clinic.findAll({
                    attributes: {
                        exclude: ['createdAt', 'updatedAt'],
                    },
                });
            }

            if (name && name !== 'ALL') {
                clinics = await db.User.findOne({
                    where: {
                        name: name,
                    },
                    attributes: {
                        exclude: ['createdAt', 'updatedAt'],
                    },
                });
            }
            resolve(clinics);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { createClinic, updateClinic, deleteClinic, getAllClinic, getClinicDetailById, getClinics };
