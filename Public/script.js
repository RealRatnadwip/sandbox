// Scroll reveal animation
document.addEventListener("DOMContentLoaded", () => {
  const revealSections = document.querySelectorAll("section");

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal");
        revealObserver.unobserve(entry.target); // Animate once
      }
    });
  }, { threshold: 0.1 });

  revealSections.forEach(section => {
    revealObserver.observe(section);
  });

  // Hamburger menu toggle
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
  });
});

// Fetch and display last update date
fetch('https://api.github.com/repos/RealRatnadwip/RealRatnadwip.github.io/commits?')
  .then(response => response.json())
  .then(data => {
    const date = new Date(data[0].commit.committer.date);

    // Format date
    const day = date.getDate().toString().padStart(2, '0');
    const monthName = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    // Format time
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    // Get user's local time zone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formatted = `Last updated: ${day} ${monthName} ${year} at ${hours}:${minutes}:${seconds} (${timeZone})`;

    const lastUpdatedElement = document.getElementById("last-updated");
    if (lastUpdatedElement) {
      lastUpdatedElement.textContent = formatted;
    }
  })
  .catch(error => {
    const lastUpdatedElement = document.getElementById("last-updated");
    if (lastUpdatedElement) {
      lastUpdatedElement.textContent = "Last updated: unavailable";
    }
  });


function updateClock() {
  const now = new Date();

  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const monthName = now.toLocaleDateString("en-US", { month: "long" });
  const day = now.getDate();
  const year = now.getFullYear();

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  // Get local timezone abbreviation
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const clockText = `Current Time - ${dayName}, ${monthName} ${day}, ${year} ${hours}:${minutes}:${seconds} (${timeZone})`;

  document.getElementById("liveClock").textContent = clockText;
}

setInterval(updateClock, 1000);
updateClock();

// Redirect countdown (for thanks.html)
const countdownEl = document.getElementById("countdown");
const redirectText = document.getElementById("redirect-text");

if (countdownEl && redirectText) {
  let seconds = 10;
  countdownEl.textContent = seconds;
  countdownEl.style.color = "#E0F11F"; // Highlight color

  const countdown = setInterval(() => {
    seconds--;
    countdownEl.textContent = seconds.toString().padStart(2, "0");

    if (seconds <= 0) {
      clearInterval(countdown);
      window.location.replace("https://realratnadwip.github.io/"); // Adjust path if needed
    }
  }, 1000);
}


const previewLayer = document.querySelector('.preview-layer');
const previewImg = document.querySelector('.preview-img');
const captionText = document.querySelector('.caption-text');
const closeBtn = document.querySelector('.close-btn');

document.querySelectorAll('.image-card').forEach(card => {
  card.addEventListener('click', () => {
    const img = card.querySelector('img');
    previewImg.src = img.src;
    captionText.textContent = card.getAttribute('data-caption') || '';
    previewLayer.classList.remove('hidden');
  });
});

closeBtn.addEventListener('click', () => {
  previewLayer.classList.add('hidden');
  previewImg.classList.remove('zoomed');
});

previewLayer.addEventListener('click', (e) => {
  if (e.target === previewLayer) {
    previewLayer.classList.add('hidden');
	previewImg.classList.remove('zoomed');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    previewLayer.classList.add('hidden');
	previewImg.classList.remove('zoomed');
  }
});

previewImg.addEventListener('click', (e) => {
  e.stopPropagation();
  previewImg.classList.toggle('zoomed');
});

// Optional zoom effect on click
document.styleSheets[0].insertRule(`
  .preview-img.zoomed {
    transform: scale(1.3);
    cursor: zoom-out;
  }
`, document.styleSheets[0].cssRules.length);