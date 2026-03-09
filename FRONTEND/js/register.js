// Register page functionality
lucide.createIcons();

// Form submit — POST to Django backend
const API_BASE = 'http://localhost:8000';
const signupBtn = document.querySelector('.btn-signup');

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const first_name = form.firstName.value.trim();
  const last_name = form.lastName.value.trim();
  const username = form.username.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  // Client-side validation
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  if (password.length < 6) {
    alert("Password should be at least 6 characters long.");
    return;
  }

  if (!form.agreeTerms.checked) {
    alert("You must agree to the Terms & Privacy to create an account.");
    return;
  }

  signupBtn.disabled = true;
  signupBtn.textContent = 'Creating account...';

  try {
    const res = await fetch(`${API_BASE}/api/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name, last_name, username, email, password }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alert('Account created successfully! Please log in.');
      window.location.href = 'login.html';
    } else {
      // Show the first validation error found
      const errorMsg =
        data.username?.[0] ||
        data.email?.[0] ||
        data.first_name?.[0] ||
        data.last_name?.[0] ||
        data.password?.[0] ||
        data.detail ||
        data.error ||
        'Registration failed. Please try again.';
      alert(errorMsg);
    }
  } catch (err) {
    alert('Cannot connect to server. Make sure the backend is running.');
  } finally {
    signupBtn.disabled = false;
    signupBtn.textContent = 'Sign Up';
  }
});
