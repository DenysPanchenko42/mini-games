// Збереження користувача в localStorage
document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      if (localStorage.getItem(username)) {
        alert("Користувач уже існує!");
        return;
      }

      const user = {
        username: username,
        password: password,
        balance: 100,
        wins: 0,
        losses: 0,
        games: 0, 
        maxBalance: 100,
        totalWon: 0,
        totalLost: 0
      };

      localStorage.setItem(username, JSON.stringify(user));
      alert("Успішна реєстрація!");
      window.location.href = "login.html";
    });
  }
});

// Авторизація користувача
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const storedUser = localStorage.getItem(username);

    if (!storedUser) {
      alert("Користувача не знайдено.");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.password !== password) {
      alert("Невірний пароль.");
      return;
    }

    // Зберігаємо в sessionStorage, щоб знати, хто увійшов
    sessionStorage.setItem("loggedInUser", username);
    alert("Вхід успішний!");
    window.location.href = "profile.html";
  });
}

// Відображення профілю користувача
function loadUserProfile() {
  const username = sessionStorage.getItem("loggedInUser");
  if (!username) {
    alert("Спочатку увійдіть у систему.");
    window.location.href = "login.html";
    return;
  }

  const storedUser = localStorage.getItem(username);
  const user = JSON.parse(storedUser);

  document.getElementById("currentUser").textContent = username;
  document.getElementById("balance").textContent = user.balance;
  document.getElementById("wins").textContent = user.wins;
  document.getElementById("losses").textContent = user.losses;
}


// Функція для виходу з акаунта
function logout() {
  sessionStorage.removeItem("loggedInUser");
  alert("Ви вийшли з акаунта.");
  window.location.href = "login.html";
}

// Автоматичне завантаження профілю
if (document.getElementById("profileName")) {
  loadUserProfile();
}

// Показ статистики
document.addEventListener("DOMContentLoaded", function () {
  const statsBtn = document.getElementById("showStatsBtn");
  const statsModal = document.getElementById("statsModal");
  const closeModal = document.querySelector("#statsModal .close");

  if (statsBtn && statsModal && closeModal) {
    statsBtn.addEventListener("click", function () {
      const username = sessionStorage.getItem("loggedInUser");
      const user = JSON.parse(localStorage.getItem(username));

      document.getElementById("statGames").textContent = `Зіграно ігор: ${user.games}`;
      document.getElementById("statWins").textContent = `Перемог: ${user.wins}`;
      document.getElementById("statLosses").textContent = `Поразок: ${user.losses}`;
      document.getElementById("statMaxBalance").textContent = `Максимальний баланс: ${user.maxBalance} ₴`;
      document.getElementById("statTotalWon").textContent = `Загалом виграно: ${user.totalWon} ₴`;
      document.getElementById("statTotalLost").textContent = `Загалом програно: ${user.totalLost} ₴`;

      // Відкриття модального вікна
      statsModal.style.display = "block";
    });

    // Закриття модального вікна при натисканні на хрестик
    closeModal.addEventListener("click", function () {
      statsModal.style.display = "none";
    });

    // Закриття модального вікна при натисканні поза вікном
    window.addEventListener("click", function (event) {
      if (event.target === statsModal) {
        statsModal.style.display = "none";
      }
    });
  }
});

// Оновлення статистики користувача після гри
function updateUserStats(balanceChange, isWin) {
  const username = sessionStorage.getItem("loggedInUser");
  if (!username) return;

  const storedUser = localStorage.getItem(username);
  const user = JSON.parse(storedUser);

  user.games++;

  if (isWin) {
    user.wins++;
    if (balanceChange > 0) user.totalWon += balanceChange;
  } else {
    user.losses++;
    if (balanceChange < 0) user.totalLost += Math.abs(balanceChange);
  }

  user.balance += balanceChange;

  if (user.balance > user.maxBalance) {
    user.maxBalance = user.balance;
  }

  // Зберігаємо оновлені дані в localStorage
  localStorage.setItem(username, JSON.stringify(user));

  // Оновлюємо профіль, щоб відобразити нові дані
  loadUserProfile();
}

document.getElementById("addBalanceBtn").addEventListener("click", function () {
    const username = sessionStorage.getItem("loggedInUser");
    if (!username) return;

    const user = JSON.parse(localStorage.getItem(username));
    if (!user) return;

    user.balance = (user.balance || 0) + 100;

    localStorage.setItem(username, JSON.stringify(user));

    // Оновлення балансу на сторінці
    document.getElementById("balance").textContent = `Баланс: ${user.balance}`;

    // Показати попередження
    const warning = document.getElementById("gamblingWarning");
    warning.style.display = "block";

    // Сховати через 5 секунд (опційно)
    setTimeout(() => {
        warning.style.display = "none";
    }, 5000);
});
