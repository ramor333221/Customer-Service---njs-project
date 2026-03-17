import User, {generateToken} from "../models/user.model.js";
import bcrypt from 'bcryptjs';


////////////////CUSTOMER + WORKER + ADMIN/////////////////////

//login
export const login = async (req, res, next) => {
    const password = req.body.password;
    const email = req.body.email;
    try {
        const userId = await User.findOne({email});
        if (!userId) {
            return next({msg: 'Login failed', type: 'not found', status: 404});
        }
        const result = await bcrypt.compare(password, userId.password);
        if (result) {
            const token = generateToken(userId);
            return res.status(200).json({
                name: userId.name,
                pictureUrl: userId.pictureUrl,
                permission: userId.permission,
                email:userId.email,
                token: token
            });
        } else {
            return next({msg: 'Login failed', type: 'not pass', status: 404});
        }
    } catch (error) {
        next({msg: error.message});
    }
};

//register
export const register = async (req, res, next) => {
    try {
        const defaultPictureUrl = "/pictures/default.png";
        const newUser = new User({
            email: req.body.email,
            name: req.body.name,
            permission: "customer",
            password: req.body.password,
            phone: req.body.phone,
            pictureUrl: req.file ? `/pictures/${req.file.filename}` : defaultPictureUrl,
        });
        await newUser.save();
        const token = generateToken(newUser);
        return res.status(201).json({
            name: newUser.name,
            pictureUrl: newUser.pictureUrl,
            permission: newUser.permission,
            email:newUser.email,
            token: token
        });

    } catch (error) {
        next({msg: error.message});
    }
};
//זריקת שגיאות
//res.status(500).json({ error:{ message:error.message }} );


//update my data
export const myUpdateWorker = async (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({message: 'User not found'});
    }
    try {
        const foundUser = await User.findOne({email: user.email});
        if (!foundUser) {
            return res.status(404).json({message: 'User not found'});
        } else {
            if (req.body.name) {
                foundUser.name = req.body.name;
            }
            if (req.body.phone) {
                foundUser.phone = req.body.phone;
            }
            if (req.body.oldPassword && req.body.newPassword) {
                const isMatch = await bcrypt.compare(req.body.oldPassword, foundUser.password);
                if (isMatch) {
                    foundUser.password = req.body.newPassword;
                }
            }
        }
        if (req.file) {
            foundUser.pictureUrl = `/pictures/${req.file.filename}`;
        }
        await foundUser.save();
        const response = foundUser.toObject();
        delete response._id;
        delete response.password;
        const token = generateToken(foundUser);
        return res.status(200).json({
            name: foundUser.name,
            pictureUrl: foundUser.pictureUrl,
            permission: foundUser.permission,
            token: token,
        });
    } catch (error) {
        next({msg: error.message});
    }
};

// ///////////////////WORKER/////////////////////////

// get the user data from the token id
export const getUserByToken = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({message: 'User not found'});
    }
    try {
        const foundUser = await User.findOne({email: user.email});
        if (!foundUser) {
            return res.status(404).json({message: 'User not found'});
        }
        const response = foundUser.toObject();
        delete response.password;
        delete response._id;
        res.status(200).json({...response});
    } catch (error) {
        res.status(500).json({message: 'Error retrieving user', error: error.message});
    }
};

//////////////////ADMIN/////////////////////

//add Worker
export const addWorker = async (req, res, next) => {
    try {
        const defaultPictureUrl = "/pictures/default.png";
        const newWorker = new User({
            email: req.body.email,
            name: req.body.name,
            permission: "worker",
            password: req.body.password,
            phone: req.body.phone,
            pictureUrl: req.file ? `/pictures/${req.file.filename}` : defaultPictureUrl,
        });
        await newWorker.save();
        const response = newWorker.toObject();
        delete response._id;
        res.status(201).json(response);
    } catch (error) {
        next({msg: error.message});
    }
};

//delete Worker
export const deleteWorker = async (req, res, next) => {
    const idToDelete = req.params.email;
    try {
        const result = await User.deleteOne({email: idToDelete});
        if (result.deletedCount === 0) {
            return res.status(404).json({error: {message: 'Worker not found'}});
        } else {
            res.json({message: 'Worker deleted successfully'});
        }
    } catch (error) {
        next({msg: error.message});
    }
};

//get worker
export const getWorkers = async (req, res, next) => {
    try {
        const workers = await User.find({permission: req.body.permission}).lean();
        if (workers.length === 0) {
            return res.status(404).json({error: {message: 'workers / users not found'}});
        }
        res.json(workers.map(({_id, ...rest}) => rest));
    } catch (error) {
        next({msg: error.message});
    }
};

//update other data
export const updateWorker = async (req, res, next) => {
    try {
        const foundUser = await User.findOne({email: req.params.email});
        if (!foundUser) {
            return res.status(404).json({message: 'User not found'});
        } else {
            if (req.body.name) {
                foundUser.name = req.body.name;
            }
            if (req.body.phone) {
                foundUser.phone = req.body.phone;
            }
            if (req.file) {
                foundUser.pictureUrl = `/pictures/${req.file.filename}`;
            }
            await foundUser.save();
            const response = foundUser.toObject();
            delete response._id;
            delete response.password;
            res.status(200).json(response);
        }
    } catch (error) {
        next({msg: error.message});
    }
};

