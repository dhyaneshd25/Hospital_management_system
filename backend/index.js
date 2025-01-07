const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
require("dotenv").config()
const app=express()

const PORT=1000

app.use(express.json())
app.use(cors())

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})

mongoose.connect(process.env.DATABASE_URL).then(()=>{
    console.log("successfully connected")
}).catch((err)=>{
console.log("unable to connect",err)
})

const schema = new mongoose.Schema({
    patientname: String,
    token: Number,
    description:String,
    status:{ type:String, default:"Scheduled"}
})

const tokenlist = mongoose.model("PatientList",schema)

app.post("/add-patient",async(req,res)=>{
try{
    const patient = new tokenlist(req.body)
    await patient.save()
    res.status(201).send('Doctor added successfully');
} catch (error) {
    console.error('Error adding doctor:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).send(`Validation Error: ${error.message}`);
    }
    res.status(500).send('Error adding doctor');
}
})
