import mongoose from 'mongoose';
import connectDB from '@/db/connectDb';

export async function PUT(req) {
  try {
    const { db } = await connectDB(); // Now connectDB returns { db: conn.connection }
    const { id, ...updateData } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ message: 'User ID is required' }), { status: 400 });
    }

    const objectId = new mongoose.Types.ObjectId(id);

    const result = await db.collection('users').updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'User updated successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}
