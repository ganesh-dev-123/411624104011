const loadBtn = document.getElementById("loadBtn");

loadBtn.addEventListener("click", () => {

    document.getElementById("status").textContent = "Loading...";
    document.getElementById("users").innerHTML = "";

    setTimeout(() => {

        fetch("https://jsonplaceholder.typicode.com/users/")
            .then(response => response.json())
            .then(data => {

                let output = "";

                data.forEach(user => {
                    output += `
                        <div class="user">
                            <p><strong>Name:</strong> ${user.name}</p>
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>Phone:</strong> ${user.phone}</p>
                        </div>
                    `;
                });

                document.getElementById("users").innerHTML = output;
                document.getElementById("status").textContent = "Loaded successfully";
            })
            .catch(error => {
                document.getElementById("status").textContent = "Error loading data";
                console.error(error);
            });

    }, 2000); // 2 seconds delay

});