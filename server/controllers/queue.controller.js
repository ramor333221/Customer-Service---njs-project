import Queue from "../models/queue.model.js";
import User from "../models/user.model.js";

//add
export const add = async (req, res, next) => {
    try {
        let custQueue = await Queue.findOne();
        if (!custQueue) {
            custQueue = new Queue({ queue: [] });
            await custQueue.save();
        }

        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const foundUser = await User.findOne({ email: user.email });
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create the new queue item
        const newQueueItem = { emailCustomer: foundUser.email, topic: req.body.topic,customerPictureUrl:foundUser.pictureUrl };
        custQueue.queue.push(newQueueItem);
        await custQueue.save();

        // Return the _id of the new queue item
        const newItemId = custQueue.queue[custQueue.queue.length - 1]._id; // Get the _id of the last item added
        res.status(201).json({ itemId: newItemId });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};





