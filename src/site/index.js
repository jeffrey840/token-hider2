const api = {
  encode: () => {
    const address = document.getElementById("address");
    const encoded = address.value.split(" ").join("+");
    return "?address=" + encoded; // Simplified, encode the address for the API call
  },
  send: () => {
    const params = api.encode();
    api.get(params); // Pass encoded address as query params
  },
  show: (result) => {
    const { isInside } = result; // Adjusted based on the actual response structure
    const resultMessage = document.getElementById("result-message");

    // Check if 'isInside' directly as it should be a boolean
    if (isInside) {
      resultMessage.textContent = "The address is within the school district.";
    } else {
      resultMessage.textContent = "The address is not within the school district.";
    }
    document.getElementById("result").hidden = false;
  },
  get: (params) => {
    fetch("/.netlify/functions/checkAddress" + params)
        .then((response) => response.json())
        .then((result) => api.show(result))
        .catch((err) => console.log(err));
  },
};

// Create event listeners
const submit = document.getElementById("submit");
const input = document.getElementById("address");
submit.addEventListener("click", api.send, false);
input.addEventListener(
    "keyup",
    function(event) {
      if (event.key === "Enter") {
        api.send();
      }
    },
    false
);
