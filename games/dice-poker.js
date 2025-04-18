  const username = sessionStorage.getItem("loggedInUser");
        let user = JSON.parse(localStorage.getItem(username));
        let balance = user.balance || 100;
        let bet = 10;
        let playerDice = [];
        let systemDice = [];
        let rerolled = false;
        let selectedIndices = [];
        let gameInProgress = false;

        const balanceDisplay = document.getElementById("balance");
        const startBtn = document.getElementById("startBtn");

        balanceDisplay.textContent = `Баланс: ${balance}`;

        function updateLocalStorage() {
            user.balance = balance;
            localStorage.setItem(username, JSON.stringify(user));
            balanceDisplay.textContent = `Баланс: ${balance}`;
        }

        function rollDice() {
            return Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1);
        }

        function renderDice(containerId, dice, selectable = false) {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            dice.forEach((val, idx) => {
                const span = document.createElement('span');
                span.className = 'dice';
                const diceFaces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
				span.textContent = diceFaces[val - 1];
                if (selectable) {
                    span.onclick = () => toggleSelect(idx, span);
                    if (selectedIndices.includes(idx)) {
                        span.classList.add('selected');
                    }
                }
                container.appendChild(span);
            });
        }

        function toggleSelect(index, element) {
            if (selectedIndices.includes(index)) {
                selectedIndices = selectedIndices.filter(i => i !== index);
                element.classList.remove('selected');
            } else {
                selectedIndices.push(index);
                element.classList.add('selected');
            }
        }

function smartBotReroll(dice) {
    const counts = {};
    for (const die of dice) {
        counts[die] = (counts[die] || 0) + 1;
    }

    // Знаходимо значення з найбільшою кількістю повторень
    let maxCount = 0;
    let targetValue = dice[0];
    for (const [value, count] of Object.entries(counts)) {
        if (count > maxCount) {
            maxCount = count;
            targetValue = Number(value);
        }
    }

    // Перекидаємо ті, що не дорівнюють цільовому значенню
    for (let i = 0; i < dice.length; i++) {
        if (dice[i] !== targetValue) {
            dice[i] = Math.floor(Math.random() * 6) + 1;
        }
    }
}



        function evaluateHand(dice) {
            const counts = Array(7).fill(0);
            dice.forEach(d => counts[d]++);
            const values = counts.filter(c => c > 0).sort((a, b) => b - a).join('');
            const sorted = [...new Set(dice)].sort();
            const isStraight = sorted.length === 5 && sorted[4] - sorted[0] === 4;

            if (values === '5') return { name: 'Покер', rank: 7 };
            if (values === '41') return { name: 'Каре', rank: 6 };
            if (values === '32') return { name: 'Фул-хаус', rank: 5 };
            if (isStraight) return { name: 'Стріт', rank: 4 };
            if (values === '311') return { name: 'Трійка', rank: 3 };
            if (values === '221') return { name: 'Дві пари', rank: 2 };
            if (values === '2111') return { name: 'Пара', rank: 1 };
            return { name: 'Старша кістка', rank: 0 };
        }

        function compareHands(player, system) {
            if (player.rank > system.rank) return 'Ви виграли!';
            if (player.rank < system.rank) return 'Система виграла!';
            const pSorted = [...playerDice].sort((a, b) => b - a);
            const sSorted = [...systemDice].sort((a, b) => b - a);
            for (let i = 0; i < 5; i++) {
                if (pSorted[i] > sSorted[i]) return 'Ви виграли!';
                if (pSorted[i] < sSorted[i]) return 'Система виграла!';
            }
            return 'Нічия!';
        }

        startBtn.onclick = () => {
    if (!gameInProgress) {
        bet = parseInt(document.getElementById("bet").value);
        if (balance < bet) {
            alert("Недостатньо коштів!");
            return;
        }
        balance -= bet;
        updateLocalStorage();
        rerolled = false;
        selectedIndices = [];
        playerDice = rollDice();
		systemDice = rollDice();  
        renderDice("playerDice", playerDice, true);
		renderDice("systemDice", systemDice, false);  
        document.getElementById("status").textContent = "Оберіть кубики для перекидання або підтвердіть хід.";
        document.getElementById("rerollBtn").disabled = false;
        document.getElementById("confirmBtn").disabled = false;
        startBtn.textContent = "Здатись";
        gameInProgress = true;
    } else {
        const confirmSurrender = confirm("Ви дійсно хочете здатись? Ставка буде втрачена.");
        if (!confirmSurrender) return;

        document.getElementById("status").innerHTML = "<b>Ви здалися. Ставка втрачена.</b>";
        user.losses = (user.losses || 0) + 1;
        user.totalLost = (user.totalLost || 0) + bet;
        user.games = (user.games || 0) + 1;
        updateLocalStorage();
        endGame();
    }
};


        document.getElementById("rerollBtn").onclick = () => {
            if (rerolled) return;
            selectedIndices.forEach(idx => {
                playerDice[idx] = Math.floor(Math.random() * 6) + 1;
            });
            selectedIndices = [];
            rerolled = true;
            renderDice("playerDice", playerDice, false);
            document.getElementById("status").textContent = "Хід підтверджено. Очікуйте хід системи...";
        };

        document.getElementById("confirmBtn").onclick = () => {
            if (!playerDice.length) return;
            document.getElementById("rerollBtn").disabled = true;
            document.getElementById("confirmBtn").disabled = true;

            smartBotReroll(systemDice);  // система перекидає кубики за логікою
			renderDice("systemDice", systemDice, false);
            const playerHand = evaluateHand(playerDice);
            const systemHand = evaluateHand(systemDice);
            const result = compareHands(playerHand, systemHand);

            document.getElementById("status").innerHTML = `
                Ваша комбінація: <b>${playerHand.name}</b><br>
                Комбінація системи: <b>${systemHand.name}</b><br><br>
                <b>${result}</b>
            `;

            if (result === 'Ви виграли!') {
                balance += bet * 2;
                user.wins = (user.wins || 0) + 1;
                user.totalWon = (user.totalWon || 0) + bet * 2;
            } else if (result === 'Система виграла!') {
                user.losses = (user.losses || 0) + 1;
                user.totalLost = (user.totalLost || 0) + bet;
            }
            user.games = (user.games || 0) + 1;
            user.maxBalance = Math.max(user.maxBalance || 0, balance);

            updateLocalStorage();
            endGame();
        };

        function endGame() {
            document.getElementById("rerollBtn").disabled = true;
            document.getElementById("confirmBtn").disabled = true;
            gameInProgress = false;
            startBtn.textContent = "Почати гру";
        }

        document.getElementById("goToProfile").onclick = () => {
            window.location.href = "../users/profile.html";
        };

        // Робота з модальним вікном правил
        const modal = document.getElementById("rulesModal");
        const rulesBtn = document.getElementById("rulesBtn");
        const closeBtn = document.querySelector(".close");

        rulesBtn.onclick = () => modal.style.display = "block";
        closeBtn.onclick = () => modal.style.display = "none";
        window.onclick = e => {
            if (e.target === modal) modal.style.display = "none";
        };
		
		
		