import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userschema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone:{type: Number,},
  pincode:{type: Number,},
  image: {
    data: Buffer,
    contentType: String
  },
  createdate: { type: Date, default: Date.now },
  updatedate: { type: Date, default: Date.now }
});

export default mongoose.models.User || model('User', userschema);
