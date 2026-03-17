import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";


//create
export const create = async (req, res, next) => {
    try{
        const {emailCustomer, topic,queueId,customerPictureUrl} = req.body;
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: 'worker not found' });
        }
        const worker = await User.findOne({email:user.email})
        const newcon = new Conversation({ _id:queueId,
            emailCustomer:emailCustomer,
            emailWorker:worker.email,
            nameWorker:worker.name,
            workerPictureUrl:worker.pictureUrl,
            customerPictureUrl:customerPictureUrl,
            topic:topic,
            date:new Date()});
        await newcon.save();
        res.status(201).json({newcon, queueId: queueId,topic: topic });
    }catch(error){
        res.status(500).json({ error: { message: error.message } });
        //next({ msg: error.message });
    }
}

//update
export const update = async (req, res, next) => {
    try {
        const { _id, converContent } = req.body;
        if (!converContent || converContent.length === 0) {
            return res.status(400).json({ msg: 'converContent is required and cannot be empty' });
        }

        const conver = await Conversation.findOne({ _id });
        if (!conver) {
            return res.status(404).json({ msg: 'Conversation not found' });
        } else {
            try {
                // Assuming you want to add the new content to converContent
                conver.converContent.push(...converContent.map(content => ({
                    description: content.description,
                    writer: content.writer || 'worker', // Default writer if not provided
                    time: new Date()
                })));

                await conver.save();

                res.status(200).json(conver);
            } catch (error) {
                next({ msg: error.message });
            }
        }
    } catch (error) {
        next({ msg: error.message });
    }
}


//get conversation by email
export const getconverByEmail = async (req, res, next) =>{
    const email=req.params.email;
    try{
        const conver = await Conversation.find({$or:[{emailCustomer:email},{emailWorker:email}]});

        if (!conver)
            res.status(404).json({ error: { message: 'not found conversation' } });
        else
            res.json(conver);
    }
    catch(error){
        next({ msg: error.message });
    }
}

//get conversation by id
// export const getconverById = async (req, res, next) =>{
//     try{
//         const conver = await Conversation.findOne({_id:req.params._id});
//
//         if(conver.length===0)
//             res.status(404).json({ error: { message: 'not found conversation' } });
//         else
//             res.json(conver);
//     }
//     catch(error){
//         next({ msg: error.message });
//     }
// }


export const getconverById = async (req, res, next) => {
    try {
        const conver = await Conversation.findOne({ _id: req.params._id });

        if (!conver) // Check if conver is null
            res.status(404).json({ error: { message: 'not found conversation' } });
        else
            res.json(conver); // Ensure this returns the full conversation object
    } catch (error) {
        next({ msg: error.message });
    }
}


//get all conversation
export const getAllConver = async (req, res) =>{
    const {emailWorker, emailCustomer, date, topic} = req.query;
    const query = Object.entries({ emailWorker, emailCustomer, date, topic })
        .reduce((acc, [key, value]) => (value ? { ...acc, [key]: value } : acc), {});


    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0); // Start of the day

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999); // End of the day

        // Add the date range to the query
        query.date = {
            $gte: startOfDay,
            $lte: endOfDay
        };
    }
    
    try{
        const conver = await Conversation.find(query);

        if(conver.length===0)
            res.status(404).json({ error: { message: 'not found conversation' } });
        else
            res.json(conver);
    }
    catch(error){
        next({ msg: error.message });
    }
}
