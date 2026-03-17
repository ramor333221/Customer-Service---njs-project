import Queue from "../models/queue.model.js";


export const deleteQ = async (req, res, next) => {
    try {
        const custQueue = await Queue.findOne();
        if (!custQueue) {
            return res.status(404).json({ error: { message: 'data is invalid' } });
        }
        if (custQueue.queue.length === 0) {
            return res.status(404).json({ error: { message: 'Queue is empty' } });
        }
        const [deletedItem] = custQueue.queue.splice(0, 1);
        await Queue.updateOne({}, { $set: { queue: custQueue.queue } });
        req.body = { emailCustomer: deletedItem.emailCustomer, topic: deletedItem.topic,queueId: deletedItem._id,customerPictureUrl:deletedItem.customerPictureUrl};
        next();
    } catch (error) {
        return res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

