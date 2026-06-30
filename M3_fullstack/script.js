const input = document.getElementById("messageInput");
const addBtn = document.getElementById("addBtn");
const clearBtn = document.getElementById("clearBtn");
const messageSection = document.getElementById("messageSection");
const status = document.getElementById("status");
const charCount = document.getElementById("charCount");

let messages = [];

// Character Count
input.addEventListener("input", function () {
    charCount.textContent = "Character Count: " + input.value.length;
});

// Display Messages
function displayMessages() {

    messageSection.innerHTML = "";

    messages.forEach(function (msg) {

        let p = document.createElement("p");

        p.className = "message";

        p.textContent = msg;

        messageSection.appendChild(p);

    });

}

// Add Message
addBtn.addEventListener("click", function () {

    let text = input.value.trim();

    let promise = new Promise(function (resolve, reject) {

        if (text.length >= 3) {
            resolve(text);
        }
        else {
            reject("Message must contain at least 3 characters");
        }

    });

    promise
        .then(function (message) {

            messages.push(message);

            displayMessages();

            status.textContent = "Message Added Successfully";

            input.value = "";

            charCount.textContent = "Character Count: 0";

            // Expire after 10 seconds
            setTimeout(function () {

                let index = messages.indexOf(message);

                if (index !== -1) {

                    messages.splice(index, 1);

                    displayMessages();

                    status.textContent = "Message Expired";
                }

            }, 10000);

        })

        .catch(function (error) {

            status.textContent = error;

        });

});

// Clear Messages
clearBtn.addEventListener("click", function () {

    messages = [];

    displayMessages();

    status.textContent = "All Messages Cleared";

});