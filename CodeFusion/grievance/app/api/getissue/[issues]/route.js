import connectDB from '@/db/connectDb';
import Issue from '@/models/Issue';

export async function GET(req, { params }) { 
  try {
    const { issues } = params;
    await connectDB(); 
    const issue = await Issue.find({ issuetype: issues });
    console.log('issues: ', issue);

    if (!issue || issue.length === 0) {
      return new Response(JSON.stringify({ message: 'No issues found' }), { status: 404 });
    }

    return new Response(JSON.stringify(issue), { status: 200 }); // Return the actual issues found
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}
