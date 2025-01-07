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