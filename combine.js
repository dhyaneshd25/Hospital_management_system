document.getElementById('tokenForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const nameInput = document.getElementById('name').value.trim();
    const nameRegex = /^[a-zA-Z\s]+$/;
    console.log(nameInput)
    if (!nameRegex.test(nameInput)) {
      document.getElementById("span").innerText = "Name must not contain numbers or special characters.";
    } 
  });

function validateForm(event)
{
    const numPatients= document.getElementById('num_patient').value;
    const refreshRate = document.getElementById('refresh').value;
    const waitTime = document.getElementById('wait_time').value;

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

    alert("Submitting...");

}


let tokenCounter = 1; 
let currentToken = 0;
let previousToken = 0;
let missingTokens = [];
const patientLimit = 100; 
const averageWaitTime = 5;

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
      token : tokenCounter,
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

