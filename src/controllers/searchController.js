import { User, DoctorInfo, Specialty, Clinic } from '../models';
import { Op } from 'sequelize';

const search = async (req, res) => {
    const { q, type } = req.query;
    console.log('Search query:', q);
    console.log('Search type:', type);

    try {
        let results = [];
        
        
        if (type && (type.trim() === 'doctor' || type.trim() === 'all')) {
            const doctors = await User.findAll({
                where: {
                    [Op.or]: [{ firstName: { [Op.like]: `%${q}%` } }, { lastName: { [Op.like]: `%${q}%` } }],
                },
            });

            if (doctors.length > 0) {
                const doctorIds = doctors.map((doctor) => doctor.id);
                const doctorInfoList = await DoctorInfo.findAll({
                    where: {
                        doctorId: {
                            [Op.in]: doctorIds,
                        },
                    },
                    include: [
                        { model: Clinic, as: 'clinicData' },
                        { model: Specialty, as: 'specialtyData' },
                        { model: User, as: 'doctorInfoData' },
                    ],
                    raw: true 
                });
                results = results.concat(doctorInfoList);
            }
            console.log('Doctors found:', doctors);
        }

       
        if (type && (type.trim() === 'clinic' || type.trim() === 'all')) {
            const clinics = await Clinic.findAll({
                where: {
                    name: { [Op.like]: `%${q}%` },
                },
                raw: true 
            });

            if (clinics.length > 0) {
                results = results.concat(clinics);
            }
        }
        if (type && (type.trim() === 'clinic' || type.trim() === 'all')) {
            const specialties = await Specialty.findAll({
                where: {
                    name: { [Op.like]: `%${q}%` }  
                }
            });

            if (specialties.length > 0) {
                const clinicIds = specialties.map(clinics => clinics.id); 

               
                const doctorsWithClinic = await DoctorInfo.findAll({
                    where: {
                        clinicId: {
                            [Op.in]: clinicIds  
                        }
                    },
                    include: [
                        {
                            model: User,
                            as: 'doctorInfoData',  
                            attributes: ['firstName', 'lastName']  
                        },
                        { model: Clinic, as: 'clinicData' },  
                        { model: Specialty, as: 'specialtyData' }  
                    ],
                    raw: true 
                });

                results = results.concat(doctorsWithClinic);  
            }
        }

       
        if (type && (type.trim() === 'specialty' || type.trim() === 'all')) {
            const specialties = await Specialty.findAll({
                where: {
                    name: { [Op.like]: `%${q}%` }  
                }
            });

            if (specialties.length > 0) {
                const specialtyIds = specialties.map(specialty => specialty.id);  

             
                const doctorsWithSpecialty = await DoctorInfo.findAll({
                    where: {
                        specialtyId: {
                            [Op.in]: specialtyIds 
                        }
                    },
                    include: [
                        {
                            model: User,
                            as: 'doctorInfoData',  
                            attributes: ['firstName', 'lastName'] 
                        },
                        { model: Clinic, as: 'clinicData' }, 
                        { model: Specialty, as: 'specialtyData' }  
                    ],
                    raw: true 
                });

                results = results.concat(doctorsWithSpecialty);  
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
