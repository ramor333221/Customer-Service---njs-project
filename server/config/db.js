import mongoose from "mongoose";


export async function connectDB(dbname) {
    try {
        const DB_URI = `mongodb://localhost:27017/${dbname}`;
        //const DB_URI =`mongodb+srv://ruchamaamor_db_user:CpjR08i0NL136RRq@customerservice.zdlaa6f.mongodb.net/?retryWrites=true&w=majority&appName=customerService`
        //const DB_URI=`mongodb+srv://ramor333221_db_user:Yd5VmEZ3FPP77rpe@cluster0.5pwj2sm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
        await mongoose.connect(DB_URI);
    } catch (error) {
        console.log('ERROR', error.message);
    }
}

