import UserService from '../services/UserService';
import { refreshTokenJwtService } from '../services/JwtService';
import { uploadImage } from '../untils/uploadImage';

const handleLogin = async (req, res) => {
    let userData = req.body;
    if (!userData.email || !userData.password) {
        res.status(500).json({
            errCode: 1,
            message: 'Missing email or password',
        });
    }
    let result = await UserService.login(userData);

    if (result.errCode === 0) {
        // set cookies
        res.cookie('accessToken', result.tokens?.accessToken, { httpOnly: true });
        res.cookie('refreshToken', result.tokens?.refreshToken, { httpOnly: true });

        // Set cookies
        // setRefreshTokenCookie(res, refreshToken);
        res.cookie('refreshToken', result.tokens?.refreshToken, {
            httpOnly: true,
            // secure: true, // Nếu sử dụng HTTPS
            sameSite: 'Strict',
        });
        return res.status(200).json({
            errCode: result.errCode,
            message: result.errMessage,
            data: result.user ? result.user : {},
            tokens: result.tokens,
        });
    } else {
        return res.status(400).json({
            errCode: result.errCode,
            message: result.errMessage,
        });
    }
};

const logout = (req, res) => {
    try {
        // Xóa token từ cookie
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(200).json({
            errCode: 0,
            message: 'Logout successfully',
        });
    } catch (error) {
        return res.status(400).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

const refreshToken = async (req, res, next) => {
    // const token = req.headers.token.split(' ')[1];
    // if (!token) {
    //     return res.status(404).json({ message: 'The token is required', errCode: -1 });
    // }
    const refreshToken = req.cookies.refreshToken;
    console.log('Refresh token', refreshToken);
    if (!refreshToken) return res.sendStatus(401);
    const response = await refreshTokenJwtService(token);
    res.status(200).json({ message: 'Success', errCode: 0, data: response });
};

const sendOtpCode = async (req, res) => {
    let email = req.body.email;
    if (!email) {
        return res.status(200).json({
            errCode: 1,
            message: 'Missing required parameter! Please check again!',
        });
    }
    let response = await UserService.sendOtpCode(email);
    return res.status(200).json(response);
};

const verifyOtpCode = async (req, res) => {
    let otp = req.body.otp;
    if (!otp) {
        return res.status(200).json({
            errCode: 1,
            message: 'Missing data! Please check again!',
        });
    }
    let result = await UserService.verifyOtpCode(otp);
    return res.status(200).json(result);
};

const getAllUsers = async (req, res) => {
    let id = req.query.id; //All / Id
    let page = parseInt(req.query.page);
    let per_page = parseInt(req.query.per_page);

    if (!id) {
        return res.status(200).json({
            errCode: 1,
            message: 'Missing required parameter! Please check again!',
            data: [],
        });
    } else {
    }
    if (id && page && per_page) {
        let users = await UserService.getAllUsers(id, page, per_page);
        return res.status(200).json({
            errCode: 0,
            message: 'OK',
            total: users.count,
            per_page: per_page,
            page: page,
            total_pages: Math.ceil(users.count / per_page),
            data: users.rows,
        });
    } else if (id && !page && !per_page) {
        let users = await UserService.getAllUsers(id);
        return res.status(200).json({
            errCode: 0,
            message: 'OK',
            data: users,
        });
    }
};

const createUser = async (req, res) => {
    try {
        let imageUrl;
        if (req.file) {
            // Upload ảnh lên Cloudinary và lấy URL
            imageUrl = await uploadImage(req.file.path);
        }

        // Tạo người dùng với thông tin đã cho
        const userData = {
            email: req.body.email,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            gender: req.body.gender,
            image: imageUrl, // Lưu URL ảnh vào database
            roleId: req.body.roleId,
            positionId: req.body.positionId,
        };

        let response = await UserService.createNewUser(userData);
        return res.status(200).json(response);
    } catch (error) {
        console.error('Lỗi lưu sản phẩm vào DB:', error);
        return res.status(500).json({ error: 'Lỗi khi tạo người dùng' });
    }
};

const updateUser = async (req, res) => {
    let userId = req.query.id;

    try {
        if (userId) {
            let imageUrl;
            if (req.file) {
                imageUrl = await uploadImage(req.file.path);
                req.body.image = imageUrl;
            }

            let response = await UserService.updateUserData(userId, req.body);
            return res.status(200).json(response);
        } else {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter! Please check again!',
            });
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật người dùng:', error);
        return res.status(500).json({ error: 'Lỗi khi cập nhật người dùng' });
    }
};

const deleteUser = async (req, res) => {
    let userId = req.query.id;
    if (userId) {
        let response = await UserService.deleteUser(userId);
        return res.status(200).json(response);
    } else {
        return res.status(200).json({
            errCode: 1,
            message: 'Missing required parameter! Please check again!',
        });
    }
};

const getAllCode = async (req, res) => {
    try {
        let type = req.query.type;
        if (!type) {
            return res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter. Please check again!',
            });
        }
        let data = await UserService.getAllCodeServices(type);
        return res.status(200).json(data);
    } catch (error) {
        console.log('Error getAllCode: ', error);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server',
        });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
    handleLogin,
    getAllCode,
    sendOtpCode,
    verifyOtpCode,
    refreshToken,
    logout,
};
