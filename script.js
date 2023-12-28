// Smooth scrolling for anchor links
document.querySelectorAll("nav a").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
  
      const targetId = this.getAttribute("href").substring(1);
      const target = document.getElementById(targetId);
  
      window.scrollTo({
        top: target.offsetTop,
        behavior: "smooth",
      });
    });
  });
  
  // Dark mode toggle
  const darkModeBtn = document.createElement("button");
  darkModeBtn.textContent = "Toggle Dark Mode";
  document.body.appendChild(darkModeBtn);
  
  darkModeBtn.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode"); // Toggle a 'dark-mode' class in your CSS
  });
  
  // Form validation (an example for email validation)
  const emailInput = document.querySelector('input[type="email"]');
  emailInput.addEventListener("input", function () {
    const email = emailInput.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailPattern.test(email);
    if (!isValid) {
      emailInput.setCustomValidity("Please enter a valid email address");
    } else {
      emailInput.setCustomValidity("");
    }
  });
  
  // Image slider (basic setup)
  let currentImageIndex = 0;
  const images = ["image1.jpg", "image2.jpg", "image3.jpg"]; // Replace with your image URLs
  const imageContainer = document.getElementById("image-slider");
  
  function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    imageContainer.src = images[currentImageIndex];
  }
  
  setInterval(showNextImage, 3000); // Change image every 3 seconds
  
  // Tooltip for links (basic setup)
  const links = document.querySelectorAll("nav a");
  links.forEach((link) => {
    link.addEventListener("mouseover", function () {
      const tooltip = document.createElement("span");
      tooltip.textContent = link.textContent;
      tooltip.classList.add("tooltip");
      link.appendChild(tooltip);
  
      link.addEventListener("mouseleave", function () {
        link.removeChild(tooltip);
      });
    });
  });
  
  // Random quote generator (basic setup)
  const quotes = ["Quote 1", "Quote 2", "Quote 3"]; // Replace with your quotes
  const quoteContainer = document.getElementById("quote");
  
  function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteContainer.textContent = quotes[randomIndex];
  }
  
  showRandomQuote(); // Show a random quote initially
  
  // Dynamic content loading (basic setup)
  window.addEventListener("scroll", function () {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      // Load more content when scrolled to the bottom
      // You can fetch and append more content here
    }
  });
  
  // Countdown timer (basic setup)
  const countdownDate = new Date("2024-01-01").getTime(); // Replace with your countdown date
  const countdownContainer = document.getElementById("countdown");
  
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = countdownDate - now;
  
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
    countdownContainer.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  
  setInterval(updateCountdown, 1000); // Update countdown every second
  updateCountdown(); // Update countdown initially
  