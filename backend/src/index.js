import app from "./app.js";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/db.js";

dotenv.config({
    path: "./.env"
});

const port = process.env.PORT || 3000;

connectDB()
    .then(()=>{
        app.listen(port,()=>{
            console.log(`Server is running on port ${port}`);
        });
        console.log("Database connected successfully");
    })
    .catch((error)=>{
        console.error("Database connection failed:",error);
        process.exit(1);
    });



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

