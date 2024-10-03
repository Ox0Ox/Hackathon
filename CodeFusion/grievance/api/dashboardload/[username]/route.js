// Example in `pages/api/dashboardload/[username].js`
import connectDB from '@/db/connectDb';
import User from '@/models/User';


export async function GET(req, { params }) {
    try {
        const { username } = params;
        await connectDB();
        const user = await User.findOne({username});
        console.log('Name: ',username);

        if (!user) {
            return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
}
