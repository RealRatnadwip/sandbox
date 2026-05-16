const supabaseUrl = 'https://ayxzljvbjqwhygpionac.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5eHpsanZianF3aHlncGlvbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1ODk0ODQsImV4cCI6MjA4MjE2NTQ4NH0.OK4jg_mK7zAjfgyKWDFU5QP0F20BdCISTTC5VnfsQS8';

const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

const dateInput = document.getElementById('date-picker');
const placeSelect = document.getElementById('place-selector');
const messageInput = document.getElementById('message-input');
const yesButton = document.getElementById('yes-button');
const maybeButton = document.getElementById('maybe-button');
const responseMessage = document.getElementById('response-message');

const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);

function showMessage(text, type = 'success') {
  responseMessage.textContent = text;
  responseMessage.className = `response-message ${type}`;
  responseMessage.classList.remove('hidden');

  setTimeout(() => {
    responseMessage.classList.add('hidden');
  }, 5000);
}

function validateForm() {
  if (!dateInput.value) {
    showMessage('Please select a date!', 'info');
    dateInput.focus();
    return false;
  }

  if (!placeSelect.value) {
    showMessage('Please choose a place!', 'info');
    placeSelect.focus();
    return false;
  }

  return true;
}

async function saveProposal() {
  if (!validateForm()) return;

  try {
    yesButton.disabled = true;
    yesButton.textContent = 'Saving...';

    const { data, error } = await supabase
      .from('date_proposals')
      .insert([
        {
          selected_date: dateInput.value,
          selected_place: placeSelect.value,
          special_message: messageInput.value || ''
        }
      ])
      .select();

    if (error) throw error;

    showMessage('YES! Your response has been saved! This is going to be amazing! 💕', 'success');

    setTimeout(() => {
      dateInput.value = '';
      placeSelect.value = '';
      messageInput.value = '';
    }, 2000);

  } catch (error) {
    console.error('Error saving proposal:', error);
    showMessage('Oops! Something went wrong. Please try again!', 'info');
  } finally {
    yesButton.disabled = false;
    yesButton.textContent = "Yes! I'd Love To!";
  }
}

function handleMaybe() {
  const messages = [
    "Take all the time you need! I'll be here waiting 💗",
    "No pressure! Think it over and let me know 🌸",
    "That's okay! Maybe another time? 💫",
    "I understand! The offer still stands whenever you're ready ✨"
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  showMessage(randomMessage, 'info');
}

yesButton.addEventListener('click', saveProposal);
maybeButton.addEventListener('click', handleMaybe);

dateInput.addEventListener('change', () => {
  const selectedDate = new Date(dateInput.value);
  const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
  console.log(`Selected ${dayOfWeek}! Great choice!`);
});

placeSelect.addEventListener('change', () => {
  if (placeSelect.value) {
    console.log(`${placeSelect.value} sounds perfect!`);
  }
});

const style = document.createElement('style');
style.textContent = `
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;
document.head.appendChild(style);