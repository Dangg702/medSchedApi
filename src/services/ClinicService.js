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

const getAllClinic = (data) => {
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
            let clinicList = {};
            const offset = (page - 1) * per_page;

            const queryOptions = {
                attributes: {
                    exclude: ['contentMarkdown', 'contentHtml', 'createdAt', 'updatedAt'],
                },
                order: [['id', 'DESC']],
                raw: true,
                nest: true,
            };

            if (name === 'ALL') {
                if (page && per_page) {
                    clinicList = await db.Clinic.findAndCountAll({
                        ...queryOptions,
                        offset,
                        limit: per_page,
                    });
                    resolve({
                        count: clinicList.count,
                        rows: clinicList.rows,
                    });
                } else {
                    clinicList = await db.Clinic.findAll(queryOptions);
                    resolve(clinicList);
                }
            } else if (name) {
                clinicList = await db.Clinic.findAndCountAll({
                    where: { date },
                    ...queryOptions,
                    offset,
                    limit: per_page,
                });
                resolve(clinicList);
            }
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { createClinic, getAllClinic, getClinicDetailById, getClinics };
