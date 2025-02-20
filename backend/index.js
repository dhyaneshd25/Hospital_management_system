const express=require("express")
const mongoose=require("mongoose")
const path = require('path');
const cors=require("cors")

require("dotenv").config()
const app=express()

const PORT=1000

app.use(express.json())
app.use(cors())

let tokenCounter=1;
let queue=[];
let missedTokens=[];

global.settings={
    patientLimit: 100, // Default, can be updated by hospital
    refreshRate: 10,   // After how many tokens missed tokens get re-prioritized
    waitTime: 50
}

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
    initializeToken();
})

mongoose.connect(process.env.DATABASE_URL).then(()=>{
    console.log("successfully connected")
}).catch((err)=>{
console.log("unable to connect",err)
})

const schema = new mongoose.Schema({
    patientname: String,
    token: {type :Number, unique:true},
    description:String,
    status:{ type:String, default:"Scheduled"}
})

const tokenlist = mongoose.model("PatientList",schema)

async function initializeToken()
{
    const latestPatient= await tokenlist.findOne().sort({token:-1}).exec();
    if(latestPatient)
    {
        tokenCounter=latestPatient.token+1;
    }
    else{
        tokenCounter=1;
    }
    console.log(`Token counter initialized to ${tokenCounter}`)
}

async function markasMissed(tokenId)
{
    const patient= await tokenlist.findOneAndUpdate({token:tokenId},{status:"missing"},{new:true});
    if(patient)
    {

        missedTokens.push(patient);
        console.log(`${tokenId} Marked as missed. `)

        missedTokens.push(patient.token);
        console.log(`${tokenId} Marked as missed. `);

    }
}


async function checkIn(tokenId)
{
    const patient= await tokenlist.findOneAndUpdate({token:tokenId},{status:"Checked In"},{new:true});
    if(patient)
    {
        console.log(`Checked in ${tokenId}`);
        return patient;
    }
    else{
        console.log(`Token ${tokenId} not found`);
        return null;
    }
} 

async function reprioritizeMissedToken()
{
    if(missedTokens.length>0)
    {
        queue.unshift(...missedTokens);
        console.log(queue)
        console.log(`Reprioritized missed tokens: ${missedTokens.join(", ")}`);
        missedTokens = [];
    }
}

app.get("/token",async(req,res)=>{
    try{
     res.json({"tokenId":tokenCounter});
    }catch(err){
        res.status(500).json({ error: 'An error occurred' });
    }
})

app.post("/add-patient",async(req,res)=>{
try{
    if (tokenCounter > settings.patientLimit) {
        return res.status(400).send("Patient limit reached! No more tokens can be issued today.");
    }
    const co=await tokenlist.countDocuments();
    if(co==0){
        initializeToken()
    }
    const patient = new tokenlist({
        patientname : req.body.patientname,
        token : tokenCounter,
        description : req.body.description,
        status : req.body.status
    })
    await patient.save()
    queue.push(patient)
    tokenCounter++;
    res.status(201).send('Patient added successfully');
} catch (error) {
    console.error('Error adding patient:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).send(`Validation Error: ${error.message}`);
    }
    res.status(500).send('Error adding doctor');
}
})

app.post("/mark-missed",async(req,res)=>{
    try{
        const {token} = req.body;
        await markasMissed(token);
        res.status(200).send(`Token ${token} marked as missed.`);
    }
    catch(error){
        res.status(500).send("Error in marking token missed");
    }
})

app.post("/check-in",async(req,res)=>{
    try{
        const {token}= req.body;
        const patient= await checkIn(token)
        if(patient)
        {
            res.status(200).send(`Token ${token} checked In successfully`);
        }
        else{
            res.status(404).send(`Token ${token} not found`);
        }
    }
    catch(error)
    {
        console.log("error during check in",error);
        res.status(500).send("Error in check in");
    }

})

app.post("/reprioritize",async(req,res)=>{
    try{
        await reprioritizeMissedToken()
        res.status(200).json({queue, missedTokens, patientLimit: settings.patientLimit, waitTime: settings.waitTime});
    }
    catch(error)
    {
        console.error("Error retrieving queue status:", error);
        res.status(500).send("Error reprioritizing missed tokens.");
    }
})

app.get("/queue-status",async(req,res)=>{
    try{
        const updatedQueue= await tokenlist.find({});
        res.status(200).json({ queue:updatedQueue, missedTokens, patientLimit: settings.patientLimit, waitTime: settings.waitTime });
    }
    catch(error)
    {
        console.error("Error retrieving queue status:", error);
        res.status(500).send("Error retrieving queue status.");
    }
})

app.post("/update-settings", async (req, res) => {
    try {
        const { patientLimit, refreshRate, waitTime } = req.body;
        if (patientLimit) settings.patientLimit = patientLimit;
        if (refreshRate) settings.refreshRate = refreshRate;
        if (waitTime) settings.waitTime = waitTime;

        
        // Step 1: Clear all documents from the token queue
        const result = await tokenlist.deleteMany({});
        console.log(`${result.deletedCount} documents deleted.`);
        
        // Step 2: Clear the missed token
        missedTokens.length=0;
        console.log(`${missedTokens} missed entries cleared.`);

        // Step 3: Initialize the token counter
        await initializeToken();

        console.log("Hospital settings updated:", settings);
        res.status(200).json({ message: 'Settings updated' });
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



const schema1 = new mongoose.Schema({
    patientLimit: Number,
    refreshRate: Number,
    waitTime:Number,
   
})

const hospitaldetails = mongoose.model("Primary Details",schema1)

app.post('/add-hospital-details',async (req,res)=>{
    try{
        const {patientLimit,refreshRate,waitTime}=req.body
        const data2 ={
            patientLimit:patientLimit,
            refreshRate:refreshRate,
            waitTime:waitTime
        }

        const hospitaldetail =new hospitaldetails(data2)
        hospitaldetail.save()
        console.log("Hospital details added successfully");
        res.status(200).json({ message: 'Hospital details added' });
    }catch(err){
        res.status(500).json({ error: 'Database operation failed' });
    }
})

// app.get('/get-hospital-details',async(req,res)=>{
//     try{
//         const data3=hospitaldetails.findOne()
//         console.log(data3)
//         res.status(200).json(data3)
//     }catch(err){
//         res.status(500).send("Internal Server error")
//     }
// })

app.get('/get-hospital-details', async (req, res) => {
    try {
        console.log("Fetching hospital details...");
        const data3 = await hospitaldetails.findOne(); // Await the query result
        if (!data3) {
            console.error("No hospital details found in the database.");
            return res.status(404).send("Hospital details not found");
        }
        console.log("Hospital details fetched:", data3);
        res.status(200).json(data3);
    } catch (err) {
        console.error("Error occurred while fetching hospital details:", err.message);
        console.error("Stack Trace:", err.stack);
        res.status(500).send("Internal Server Error");
    }
});

