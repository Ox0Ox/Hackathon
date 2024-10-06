import { NextResponse } from 'next/server';
import connectDB from '@/db/connectDb'; // Adjust path to your database connection utility
import { ObjectId } from 'mongodb'; // Import ObjectId correctly

// Connect to the database
async function getDatabase() {
    const { db } = await connectDB();
    return db;
}

export async function GET(request) {
    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    const userId = url.searchParams.get('userId'); // Current user ID

    if (!username) {
        return NextResponse.json({ exists: false, error: 'Username query parameter is required' }, { status: 400 });
    }

    try {
        const db = await getDatabase();
        
        // Construct query to exclude the current user ID
        const query = userId 
            ? { username, _id: { $ne: new ObjectId(userId) } } // Exclude current user's ID using ObjectId
            : { username }; // Check all entries if userId is not provided

        const user = await db.collection('users').findOne(query);

        return NextResponse.json({ exists: Boolean(user) });
    } catch (error) {
        console.error('Error checking username:', error);
        return NextResponse.json({ exists: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
