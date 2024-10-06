// Example in `pages/api/user-profile/[id].js`
import connectDB from '@/db/connectDb';
import Issue from '@/models/Issue';

// PUT endpoint to update user data
export async function PUT(req, { params }) {
  try {
    // Get the user ID from the URL parameters
    const { id } = params;
    // Get the updated user data from the request body
    const data = await req.json();
    // Connect to the database
    await connectToDatabase();
    // Update the user data
    const newIssue = await Issue.create(data.data);
    // Return the updated user data
    return new Response(JSON.stringify(newIssue ), { status: 200 });
  } catch (error) {
    // If an error occurs, return a 500 error
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}