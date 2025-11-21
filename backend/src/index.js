import app from "./app.js";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/db.js";

dotenv.config({
    path: "./.env"
});

const port = process.env.Port || 3000;

app.use(cors({
    origin:"localhost:5173",
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}))
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get("/",(req,res)=>{
    res.send("API is working");
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})