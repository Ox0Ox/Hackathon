import connectDB from '@/db/connectDb';
import mongoose from 'mongoose';
import Issue from '@/models/Issue';

export async function POST(req) {
    const { db } = await connectDB();
    try {
        const data = await req.json(); // Parse incoming request JSON
        console.log('this is request: ', data);
        const x = new mongoose.Types.ObjectId()
        // Use updateOne with upsert: true to either update or create a new issue
        const newIssue = await Issue.updateOne(
            { _id: x }, // Force creation of a new document
            { $set: {} }, // Set the data, preserving data URLs
            { upsert: true } // Insert the document if it doesn't exist
        );

        console.log('this is new issue:', newIssue);

        const result = await db.collection('issues').updateOne(
            { _id: x },
            { $set: data }
          );

        return new Response(JSON.stringify(result), { status: 201 });
    } catch (error) {
        console.error('Error creating issue:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}
