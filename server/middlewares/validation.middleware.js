export const validateJoiSchema = function (joiSchema) {
    return (req, res, next) => {
        const { value, error } = joiSchema.validate(req.body);
        if (error) {
            //res.status(400).json('validation failed');
            res.status(400).json({msg: error.message });
        }
        else {
            req.body = value;
            next();
        }
    };
}