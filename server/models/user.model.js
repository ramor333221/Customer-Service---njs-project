import {model, Schema} from "mongoose";
import Joi from 'joi'
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    email:{ type: String, required: true, unique: true, lowercase: true },
    name:String,
    phone:String,
    password:String,
    permission:{type:String, enum:['admin', 'worker','customer','anonymous']},
    pictureUrl:String,
})

userSchema.pre('save', async function () {
    if (this.permission!=="anonymous" && this.isModified('password'))
    {
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(this.password, salt); 
        this.password = hash;
    }
});

// סכמות לבדיקת תקינות מורכבת
export const validUser = {
    Register: Joi.object({
        email: Joi.string().pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).lowercase().required(),
        name:Joi.string().required().min(2).max(15),
        password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#$%^&*()\\-_=+{};:.<>?])[a-zA-Z0-9!@#$%^&*()\\-_=+{};:.<>?]+$')).required()
        .messages({
            'string.pattern.base': 'Password must contain only letters and numbers.',
            'string.min': 'Password must be at least 8 characters long.'
        }),
        phone: Joi.string().length(10).optional(),
        pictureUrl: Joi.string().optional(),
    }),
    login: Joi.object({
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#$%^&*()\\-_=+{};:.<>?])[a-zA-Z0-9!@#$%^&*()\\-_=+{};:.<>?]+$')).required()
        .messages({
            'string.pattern.base': 'Password must contain only letters and numbers.',
            'string.min': 'Password must be at least 8 characters long.'
        })
    }),
    delete:Joi.object({
        email: Joi.string().email().lowercase().required(),
    }),
}


export const generateToken = (user) => {
    const payload = { email: user.email, permission: user.permission };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return token;
};

const User = model('Users',userSchema);
export default User;
