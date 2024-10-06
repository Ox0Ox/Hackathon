import mongoose from "mongoose";
import { defaultConfig } from "next/dist/server/config-shared";

const {Schema, model} = mongoose

const IssueSchema = new Schema({
    postby: {type: String, required: true},
    issuetype: {type: String, required: true},
    title: {type: String, required: true},
    desc: {type: String, required: true},
    comments: {type: String},
    done: {type: Boolean, default: false},
    createdate: {type: Date, default: Date.now},
    updatedate: {type: Date, default: Date.now},
})

export default mongoose.models.Issue || model('Issue', IssueSchema)