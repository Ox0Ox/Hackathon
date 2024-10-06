// Example in `pages/api/user-profile/[id].js`
import connectDB from '@/db/connectDb';
import User from '@/models/User';

// GET endpoint to fetch user data
export async function GET(req, { params }) {
  try {
    // Get the user ID from the URL parameters
    const { id } = params;
    // Connect to the database
    await connectDB();
    // Find the user by ID
    const user = await User.findOne({ _id: id });
    console.log('This is user:', user);

    // If the user is not found, return a 404 error
    if (!user) {
      return new Response(JSON.stringify({ message: 'User  not found' }), { status: 404 });
    }

    // Return the user data
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    // If an error occurs, return a 500 error
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}

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
    const updatedUser  = await User.findOneAndUpdate(id, data.data, { new: true });

    // If the user is not found, return a 404 error
    if (!updatedUser ) {
      return new Response(JSON.stringify({ message: 'User  not found' }), { status: 404 });
    }

    // Return the updated user data
    return new Response(JSON.stringify(updatedUser ), { status: 200 });
  } catch (error) {
    // If an error occurs, return a 500 error
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}