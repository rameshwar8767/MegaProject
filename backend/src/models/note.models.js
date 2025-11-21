import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({

});

export const Note = mongoose.model("Note", noteSchema);