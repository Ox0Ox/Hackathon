import connectDB from '@/db/connectDb';
import mongoose from 'mongoose';
import NextAuth from 'next-auth';
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import User from '@/models/User';

export const authoptions = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,  // Add Google Client ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Add Google Client Secret
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account.provider === 'github' || account.provider === 'google') {
        try {
          await connectDB(); // Ensure DB connection

          // Check if user exists in the database
          const currentUser = await User.findOne({ email: user.email });

          if (!currentUser) {
            // Create new user if not found
            const newUser = await User.create({
              email: user.email,
              username: user.email.split('@')[0],
            });
            user.name = newUser.username;
            console.log('New user created:', newUser);
          } else {
            user.name = currentUser.username;
            console.log('Existing user:', currentUser);
          }
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
    },
    async session({ session, user, token }) {
      try {
        const dbUser = await User.findOne({ email: session.user.email });
        session.user.id = dbUser?._id.toString(); // Add this line
        session.user.name = dbUser?.username || session.user.name;
        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        return session;
      }
    }
  }
});

export { authoptions as GET, authoptions as POST };
