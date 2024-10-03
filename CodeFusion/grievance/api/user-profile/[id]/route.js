// Example in `pages/api/user-profile/[id].js`
import connectDB from '@/db/connectDb';
import User from '@/models/User';

export async function GET(req, { params }) {
    try {
        const { id } = params;
        await connectDB();
        const user = await User.findById(id);

        if (!user) {
            return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = params;
        const data = await req.json();
        await connectToDatabase();
        const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });

        if (!updatedUser) {
            return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(updatedUser), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
}
