const form = document.querySelector(".form");

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  
  // Debug Log
  console.log("Login button clicked");

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const btn = form.querySelector("button");
  
  // Disable button to prevent double clicks
  btn.disabled = true;
  btn.textContent = "Logging in...";

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();

    if (result.success) {
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      }
      
      // Use window.showToast to ensure we hit the global function
      if (window.showToast) window.showToast("Login Successful!", "success");
      else alert("Login Successful!");

      setTimeout(() => {
          window.location.href = "/";
      }, 1000);

    } else {
      if (window.showToast) window.showToast(result.message, "error");
      else alert(result.message);
      
      btn.disabled = false;
      btn.textContent = "Login";
    }

  } catch (err) {
    console.error("Login Error:", err);
    if (window.showToast) window.showToast("Server connection failed. Is the backend running?", "error");
    else alert("Server connection failed.");
    
    btn.disabled = false;
    btn.textContent = "Login";
  }
});