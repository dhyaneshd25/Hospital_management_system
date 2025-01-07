document.getElementById('tokenForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const nameInput = document.getElementById('name').value.trim();
    
    const nameRegex = /^[a-zA-Z\s]+$/;

    if (!nameRegex.test(nameInput)) {
      document.getElementById("span").innerText = "Name must not contain numbers or special characters.";
    } 
  });
