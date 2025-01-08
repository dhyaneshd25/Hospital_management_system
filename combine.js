
document.getElementById('tokenForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const nameInput = document.getElementById('name').value.trim();
    const nameRegex = /^[a-zA-Z\s]+$/;
    console.log(nameInput)
    if (!nameRegex.test(nameInput)) {
      document.getElementById("span").innerText = "Name must not contain numbers or special characters.";
    } 
  });

  let numPatients;
  let waitTime;
  let refreshRate;
  

  const data1={
    patientLimit:numPatients,
    refreshRate: refreshRate,
    waitTime: waitTime
  }
  

function validateForm(event)
{
  numPatients= document.getElementById('num_patient').value;
  refreshRate = document.getElementById('refresh').value;
  waitTime = document.getElementById('wait_time').value;

    if(numPatients==='' || isNaN(numPatients) || numPatients<=0)
    {
        alert("Please enter the valid number of patients:");
        return;
    }

    if(refreshRate==='' || isNaN(refreshRate) || refreshRate<=0)
    {
        alert("Please enter the valid number of refresh rate:");
        return;
    }

    if (waitTime === '' || isNaN(waitTime) || waitTime < 0) 
    {
        alert('Please enter a valid waiting time (0 or more minutes).');
        return;
    }

    fetch("http://localhost:1000/update-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data1),
    })


    alert("Submitting...");

}




let tokenCounter = 1; 
function updatetoken(){
  fetch("http://localhost:1000/token").then(response => response.json()).then(data=>{
   
    tokenCounter=data.tokenId
    console.log(tokenCounter)
  }).catch(err=>{
    console.log(err)
  })
}
updatetoken()
let currentToken = 0;
let previousToken = 0;
let missingTokens = [];
const patientLimit = numPatients; 
const averageWaitTime = waitTime;

const tokenForm = document.getElementById("tokenForm");
const currentTokenDisplay = document.getElementById("currentToken");
const previousTokenDisplay = document.getElementById("previousToken");
const missingTokensDisplay = document.getElementById("missingTokens");
const patientLimitDisplay = document.getElementById("patientLimit");
const waitingTimeDisplay = document.getElementById("waitingTime");

function updateDisplay() {
  currentTokenDisplay.textContent = currentToken || "-";
  previousTokenDisplay.textContent = previousToken || "-";
  missingTokensDisplay.textContent = missingTokens.join(", ") || "-";
  patientLimitDisplay.textContent = patientLimit;
  waitingTimeDisplay.textContent = `${(tokenCounter - currentToken - 1) * averageWaitTime} mins`;
}

tokenForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (tokenCounter > patientLimit) {  
    alert("Patient limit reached! No more tokens can be issued today.");
    return;
  }

  const name = document.getElementById("name").value;
  const problem = document.getElementById("problem").value;

  if (!name || !problem) {
    alert("Please fill in all fields.");
    return;
  }

  alert(`Token ${tokenCounter} has been booked for ${name}.`);
  currentToken = tokenCounter;
  const data = {
      patientname : name,
      description : problem,
      status : "Scheuled"

  }

  fetch("http://localhost:1000/add-patient",{
    method:"POST",
    headers:{
       'Content-Type': 'application/json',
    },
    body:JSON.stringify(data)
  })
  tokenCounter++;
  updateDisplay();

 
  tokenForm.reset();
});


updateDisplay();


function getDetails() {
  fetch("http://localhost:1000/queue-status", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      const patientDetails = document.getElementById("patientDetails");
      patientDetails.innerHTML = ""; 
      
      if (data.queue && data.queue.length > 0) {
        const queueHeader = document.createElement("h3");
        queueHeader.textContent = "Queue:";
        patientDetails.appendChild(queueHeader);

        data.queue.forEach((patient) => {
          const patientDiv = createPatientRow(patient);
          patientDetails.appendChild(patientDiv);
        });
      }

      if (data.missedTokens && data.missedTokens.length > 0) {
        const missedHeader = document.createElement("h3");
        missedHeader.textContent = "Missed Tokens:";
        patientDetails.appendChild(missedHeader);

        data.missedTokens.forEach((token) => {
          const missedDiv = document.createElement("div");
          missedDiv.textContent = `Token ${token}`;
          patientDetails.appendChild(missedDiv);
        });
      }
    })
    .catch((error) => console.error("Error fetching queue details:", error));
}


function createPatientRow(patient) {
  const patientDiv = document.createElement("div");
  patientDiv.classList.add("patient-row");

  const patientInfo = document.createElement("span");
  patientInfo.textContent = `Token ${patient.token}: ${patient.patientname} (${patient.description}) - Status: ${patient.status}`;
  patientDiv.appendChild(patientInfo);

  
  const checkInButton = document.createElement("button");
  checkInButton.textContent = "Check-In";
  checkInButton.onclick = () => checkIn(patient.token);
  patientDiv.appendChild(checkInButton);


  const markMissedButton = document.createElement("button");
  markMissedButton.textContent = "Mark as Missed";
  markMissedButton.onclick = () => markAsMissed(patient.token);
  patientDiv.appendChild(markMissedButton);

  return patientDiv;
}


function checkIn(token) {
  fetch("http://localhost:1000/check-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  })
    .then((response) => response.text())
    .then((message) => {
      alert(message);
      getDetails(); 
    })
    .catch((error) => console.error("Error checking in patient:", error));
}


function markAsMissed(token) {
  fetch("http://localhost:1000/mark-missed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  })
    .then((response) => response.text())
    .then((message) => {
      alert(message);
      getDetails(); 
    })
    .catch((error) => console.error("Error marking token as missed:", error));
}

function update()
{
  fetch("http://localhost:1000/update-settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data1),
  })
}