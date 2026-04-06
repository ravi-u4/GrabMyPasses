/* frontend/signup/signup.js */
const form = document.querySelector("form");
const regBtn = document.getElementById("regBtn");
const btnText = document.getElementById("btnText");
const loader = document.getElementById("loader");
const checkIcon = document.getElementById("checkIcon");
const successMsg = document.getElementById("successMsg");

// Section Containers
const signupSection = document.getElementById("signupSection");
const otpSection = document.getElementById("otpSection");

// Form Inputs
const fullname = document.getElementById("fullname");
const college = document.getElementById("college");
const mobile = document.getElementById("mobile");
const email = document.getElementById("email");
const roll = document.getElementById("roll");
const course = document.getElementById("course");
const semester = document.getElementById("semester");
const dob = document.getElementById("dob");
const gender = document.getElementById("gender");
const password = document.getElementById("password");

// OTP Elements
const otpInput = document.getElementById("otpInput");
const verifyBtn = document.getElementById("verifyBtn");
const verifyBtnText = document.getElementById("verifyBtnText");
const verifyLoader = document.getElementById("verifyLoader");
const resendBtn = document.getElementById("resendBtn");

// --- SET UP 13+ AGE LIMIT FOR DOB CALENDAR ---
const today = new Date();
const maxYear = today.getFullYear() - 13;
const maxDate = new Date(maxYear, today.getMonth(), today.getDate()).toISOString().split('T')[0];
dob.max = maxDate; // Prevent selecting dates newer than 13 years ago

// --- SET UP PASSWORD LENGTH RULES ---
password.minLength = 6;
password.maxLength = 16;

let isOrganizer = false;
let signupData = {}; 
let resendTimer = null;
const COOLDOWN_SECONDS = 30;

const userBtn = document.getElementById("userMode");
const adminBtn = document.getElementById("adminMode");

// --- Mode Selection Logic ---
userBtn.addEventListener("click", () => {
  isOrganizer = false;
  userBtn.classList.add("active");
  adminBtn.classList.remove("active");
});

adminBtn.addEventListener("click", () => {
  isOrganizer = true;
  adminBtn.classList.add("active");
  userBtn.classList.remove("active");
});

const params = new URLSearchParams(window.location.search);
if (params.get("role") === "organizer") {
  isOrganizer = true;
  adminBtn.classList.add("active");
  userBtn.classList.remove("active");
}

// --- Mobile Number Formatting ---
mobile.value = "+91 ";
mobile.addEventListener("keydown", (e) => {
  if (mobile.selectionStart <= 4 && (e.key === "Backspace" || e.key === "Delete")) {
    e.preventDefault();
  }
});
mobile.addEventListener("input", () => {
  let digits = mobile.value.replace("+91 ", "").replace(/\D/g, "").substring(0, 10);
  mobile.value = "+91 " + digits;
});

// --- STEP 1: SIGNUP FORM SUBMISSION ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (mobile.value.replace("+91 ", "").length !== 10) {
    if(window.showToast) window.showToast("Mobile number must be 10 digits", "error");
    else alert("Mobile number must be 10 digits");
    return;
  }

  if (password.value.length < 6 || password.value.length > 16) {
    if(window.showToast) window.showToast("Password must be between 6 and 16 characters", "error");
    else alert("Password must be between 6 and 16 characters");
    return;
  }

  btnText.style.display = "none";
  loader.style.display = "inline-block";
  regBtn.disabled = true;

  // Capture data for potential resend
  signupData = {
    name: fullname.value,
    college: college.value,
    mobile: mobile.value,
    email: email.value,
    roll: roll.value,
    course: course.value,
    semester: semester.value,
    dob: dob.value,
    gender: gender.value,
    password: password.value
  };

  const url = isOrganizer ? "/api/organizer/signup" : "/api/signup";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(signupData)
    });

    const result = await res.json();

    if (result.success) {
      loader.style.display = "none";
      checkIcon.style.display = "inline-block";
      
      if(window.showToast) window.showToast("OTP sent to email. Please verify.", "success");
      
      // Changed: Show OTP Section for BOTH User and Organizer
      setTimeout(() => {
         signupSection.style.display = "none";
         otpSection.style.display = "block";
         startResendCooldown();
         btnText.style.display = "inline-block";
         checkIcon.style.display = "none";
         regBtn.disabled = false;
      }, 1000);
      
    } else {
      if(window.showToast) window.showToast(result.message, "error");
      else alert(result.message);
      
      btnText.style.display = "inline-block";
      loader.style.display = "none";
      regBtn.disabled = false;
    }
  } catch (err) {
    console.error(err);
    if(window.showToast) window.showToast("Server error. Try again later.", "error");
    btnText.style.display = "inline-block";
    loader.style.display = "none";
    regBtn.disabled = false;
  }
});

// --- STEP 2: RESEND OTP LOGIC ---
resendBtn.addEventListener("click", async () => {
    startResendCooldown();
    // Changed: Set dynamic URL based on role
    const url = isOrganizer ? "/api/organizer/signup" : "/api/signup"; 
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(signupData)
        });
        const result = await res.json();

        if (result.success) {
            if(window.showToast) window.showToast("OTP resent successfully!", "success");
        } else {
            if(window.showToast) window.showToast(result.message || "Failed to resend OTP", "error");
        }
    } catch (err) {
        console.error(err);
        if(window.showToast) window.showToast("Network error. Try again.", "error");
    }
});

function startResendCooldown() {
    if (resendTimer) clearInterval(resendTimer);
    
    resendBtn.disabled = true;
    resendBtn.style.opacity = "0.5";
    resendBtn.style.cursor = "not-allowed";
    resendBtn.style.textDecoration = "none";
    
    let timeLeft = COOLDOWN_SECONDS;
    resendBtn.innerText = `Resend in ${timeLeft}s`;
    
    resendTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(resendTimer);
            resendBtn.disabled = false;
            resendBtn.style.opacity = "1";
            resendBtn.style.cursor = "pointer";
            resendBtn.style.textDecoration = "underline";
            resendBtn.innerText = "Resend";
        } else {
            resendBtn.innerText = `Resend in ${timeLeft}s`;
        }
    }, 1000);
}

// --- STEP 3: OTP VERIFICATION ---
verifyBtn.addEventListener("click", async () => {
    const otpValue = otpInput.value.trim();

    if(otpValue.length !== 6) {
        if(window.showToast) window.showToast("Please enter a valid 6-digit OTP", "error");
        return;
    }

    verifyBtnText.style.display = "none";
    verifyLoader.style.display = "inline-block";
    
    verifyLoader.style.border = "3px solid transparent";
    verifyLoader.style.borderTop = "3px solid white";
    verifyLoader.style.borderRadius = "50%";
    verifyLoader.style.width = "18px";
    verifyLoader.style.height = "18px";
    verifyLoader.style.animation = "spin .6s linear infinite"; 
    
    verifyBtn.disabled = true;

    // Changed: Point to different verify endpoints based on role
    const verifyUrl = isOrganizer ? "/api/organizer/verify-otp" : "/api/verify-otp";

    try {
        const res = await fetch(verifyUrl, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email: signupData.email, otp: otpValue })
        });

        const result = await res.json();

        if (result.success) {
            if(window.showToast) window.showToast("Verification Successful!", "success");
            successMsg.innerText = "✅ Verification Successful! Redirecting...";
            successMsg.classList.add("show");

            // Changed: Redirect to the proper login page based on role
            setTimeout(() => { 
                if(isOrganizer) {
                    window.location.href = "/admin/login.html";
                } else {
                    window.location.href = "../login/login.html"; 
                }
            }, 1600);
        } else {
            if(window.showToast) window.showToast(result.message || "Invalid OTP", "error");
            verifyBtnText.style.display = "inline-block";
            verifyLoader.style.display = "none";
            verifyBtn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        if(window.showToast) window.showToast("Verification failed. Try again.", "error");
        verifyBtnText.style.display = "inline-block";
        verifyLoader.style.display = "none";
        verifyBtn.disabled = false;
    }
});