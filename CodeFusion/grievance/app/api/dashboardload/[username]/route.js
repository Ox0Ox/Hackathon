// Example in `pages/api/dashboardload/[username].js`
import connectDB from '@/db/connectDb';
import Issue from '@/models/Issue';


export async function GET(req, { params }) {
    try {
        const { issues } = params;
        await connectDB();
        const user = await Issue.find({issues});
        console.log('Name: ',issues);

        if (!user) {
            return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
}
