const form = document.getElementById("registrationForm");
const formMessage = document.getElementById("formMessage");
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const fields = form.querySelectorAll("[data-required='true']");

// Show a field-specific error and apply the error CSS class.
function showError(field, message) {
    const wrapper = field.closest(".field");
    wrapper.classList.add("error");
    wrapper.querySelector(".error-message").textContent = message;
    field.setAttribute("aria-invalid", "true");
}

// Clear the error styling and message when a field is corrected.
function clearError(field) {
    const wrapper = field.closest(".field");
    wrapper.classList.remove("error");
    wrapper.querySelector(".error-message").textContent = "";
    field.removeAttribute("aria-invalid");
}

function validateField(field) {
    const value = field.type === "checkbox" ? field.checked : field.value.trim();
    const label = field.dataset.label;

    if (field.dataset.required === "true" && !value) {
        showError(field, field.type === "checkbox"
            ? "Please confirm the agreement before submitting."
            : `${label} is required.`);
        return false;
    }

    if (field.id === "email" && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            showError(field, "Enter a valid email address, such as name@example.com.");
            return false;
        }
    }

    if (field.id === "phone" && value) {
        // Accepts Philippine mobile numbers in 09XXXXXXXXX or +639XXXXXXXXX format.
        const phonePattern = /^(09\d{9}|\+639\d{9})$/;
        if (!phonePattern.test(value)) {
            showError(field, "Use 09XXXXXXXXX or +639XXXXXXXXX (11 or 13 characters).");
            return false;
        }
    }

    if (field.id === "dob" && value) {
        const birthDate = new Date(value + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (birthDate > today) {
            showError(field, "Date of birth cannot be in the future.");
            return false;
        }
    }

    if (field.id === "password" && value && value.length < 8) {
        showError(field, "Password must contain at least 8 characters.");
        return false;
    }

    if (field.id === "confirmPassword" && value && value !== password.value) {
        showError(field, "Passwords do not match.");
        return false;
    }

    clearError(field);
    return true;
}

// Validate fields as the user interacts with them.
fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("change", () => {
        validateField(field);
        if (field.id === "password" && confirmPassword.value) {
            validateField(confirmPassword);
        }
    });
    field.addEventListener("input", () => {
        if (field.closest(".field").classList.contains("error")) {
            validateField(field);
        }
        if (field.id === "password" && confirmPassword.value &&
            confirmPassword.closest(".field").classList.contains("error")) {
            validateField(confirmPassword);
        }
        formMessage.className = "form-message";
        formMessage.textContent = "";
    });
});

// classList.toggle() changes both password fields between hidden and visible.
togglePassword.addEventListener("click", () => {
    const isVisible = togglePassword.classList.toggle("visible");
    password.type = isVisible ? "text" : "password";
    confirmPassword.type = isVisible ? "text" : "password";
    togglePassword.textContent = isVisible ? "Hide passwords" : "Show passwords";
    togglePassword.setAttribute("aria-pressed", String(isVisible));
    // Meaningfully update the button's accessible label using an HTML attribute.
    togglePassword.setAttribute("aria-label",
        isVisible ? "Hide password text" : "Show password text");
});

form.addEventListener("submit", function(event) {
    event.preventDefault();

    let isFormValid = true;
    fields.forEach((field) => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });

    if (!isFormValid) {
        formMessage.className = "form-message failure";
        formMessage.textContent = "Please correct the highlighted fields before submitting.";
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
    }

    formMessage.className = "form-message success";
    formMessage.textContent = "Registration successful! All required information has been validated.";
    fields.forEach(clearError);
});

form.addEventListener("reset", () => {
    // Wait until the browser resets the form values, then restore the original UI state.
    setTimeout(() => {
        fields.forEach(clearError);
        formMessage.className = "form-message";
        formMessage.textContent = "";
        password.type = "password";
        confirmPassword.type = "password";
        togglePassword.classList.remove("visible");
        togglePassword.textContent = "Show passwords";
        togglePassword.setAttribute("aria-pressed", "false");
        togglePassword.setAttribute("aria-label", "Show password text");
    }, 0);
});
