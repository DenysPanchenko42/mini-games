let playerScore = 0;
        let systemScore = 0;
        let turnScore = 0;
        let username = sessionStorage.getItem("loggedInUser");
        let user = JSON.parse(localStorage.getItem(username));
        let balance = user.balance || 100;
        let playerBet = 10;
        let gameActive = false;
        let playerTurn = true;
		document.getElementById("balance").textContent = `Баланс: ${balance}`;

        function startGame() {
            playerBet = parseInt(document.getElementById("bet").value);
            if (balance < playerBet) {
                alert("Недостатньо коштів для ставки!");
                return;
            }
            document.getElementById("message").textContent = "";
            document.getElementById("startGame").textContent = "Здатись";
            document.getElementById("bet").disabled = true;

            balance -= playerBet;
            document.getElementById("balance").textContent = `Баланс: ${balance}`;

            playerScore = 0;
            systemScore = 0;
            turnScore = 0;
            playerTurn = true;
            gameActive = true;

            updateDisplay();
            enablePlayerControls();

            user.balance = balance;
            localStorage.setItem(username, JSON.stringify(user));
        }

        function rollDice() {
            if (!gameActive || !playerTurn) return;

            let roll = Math.floor(Math.random() * 6) + 1;
            const diceEmojis = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
			document.getElementById("diceResult").innerHTML = `Ви кинули: <span class="dice">${diceEmojis[roll]}</span>`;

            if (roll === 1) {
                turnScore = 0;
                document.getElementById("turnScore").textContent = `Очки цього ходу: 0`;
                disablePlayerControls();
                setTimeout(systemTurn, 1000);
            } else {
                turnScore += roll;
                document.getElementById("turnScore").textContent = `Очки цього ходу: ${turnScore}`;
            }
        }

        function takePoints() {
            if (!gameActive || !playerTurn) return;

            playerScore += turnScore;
            turnScore = 0;
            updateDisplay();

            if (playerScore >= 100) {
                alert("Гравець виграв!");

                balance += playerBet * 2;
                user.balance = balance;
                user.games = (user.games || 0) + 1;
                user.wins = (user.wins || 0) + 1;
                user.totalWon = (user.totalWon || 0) + playerBet * 2;
                user.maxBalance = Math.max(user.maxBalance || 0, balance);

                localStorage.setItem(username, JSON.stringify(user));
				document.getElementById("balance").textContent = `Баланс: ${balance}`;

                gameActive = false;
                disablePlayerControls();
                document.getElementById("startGame").textContent = "Почати гру";
                document.getElementById("bet").disabled = false;
                return;
            }

            disablePlayerControls();
            setTimeout(systemTurn, 1000);
        }

        function systemTurn() {
            playerTurn = false;
            let systemTurnScore = 0;
            let rolls = 0;

            function rollSystem() {
                if (!gameActive) return;

                let roll = Math.floor(Math.random() * 6) + 1;
                const diceEmojis = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
				document.getElementById("diceResult").innerHTML = `Система кинула: <span class="dice">${diceEmojis[roll]}</span>`;

                if (roll === 1) {
                    systemTurnScore = 0;
                    endSystemTurn();
                } else {
                    systemTurnScore += roll;
                    document.getElementById("turnScore").textContent = `Очки цього ходу: ${systemTurnScore}`;
                    rolls++;
                    if (systemScore + systemTurnScore >= 100 || rolls >= 5) {
                        systemScore += systemTurnScore;
                        endSystemTurn();
                    } else {
                        setTimeout(rollSystem, 1200);
                    }
                }
            }

            function endSystemTurn() {
                updateDisplay();
                if (systemScore >= 100) {
                    alert("Система виграла!");

                    user.balance = balance;
                    user.games = (user.games || 0) + 1;
                    user.losses = (user.losses || 0) + 1;
                    user.totalLost = (user.totalLost || 0) + playerBet;
                    user.maxBalance = Math.max(user.maxBalance || 0, balance);

                    localStorage.setItem(username, JSON.stringify(user));
					document.getElementById("balance").textContent = `Баланс: ${balance}`;

                    gameActive = false;
                    document.getElementById("startGame").textContent = "Почати гру";
                    document.getElementById("bet").disabled = false;
                    return;
                }
                playerTurn = true;
                turnScore = 0;
                enablePlayerControls();
            }

            rollSystem();
        }

        function updateDisplay() {
            document.getElementById("playerScore").textContent = `Гравець: ${playerScore}`;
            document.getElementById("systemScore").textContent = `Система: ${systemScore}`;
            document.getElementById("turnScore").textContent = `Очки цього ходу: ${turnScore}`;
            document.getElementById("balance").textContent = `Баланс: ${balance}`;
        }

        function enablePlayerControls() {
            document.getElementById("rollBtn").disabled = false;
            document.getElementById("takePointsBtn").disabled = false;
        }

        function disablePlayerControls() {
            document.getElementById("rollBtn").disabled = true;
            document.getElementById("takePointsBtn").disabled = true;
        }

        document.getElementById("rulesBtn").addEventListener("click", function () {
            document.getElementById("rulesModal").style.display = "block";
        });

        function closeRules() {
            document.getElementById("rulesModal").style.display = "none";
        }

        function handleStartOrSurrender() {
            const button = document.getElementById("startGame");
            if (gameActive) {
                const confirmGiveUp = confirm("Ви впевнені, що хочете здатись?");
                if (confirmGiveUp) {
                    gameActive = false;
                    document.getElementById("message").textContent = "Ви здались. Перемога системи!";

                    user.balance = balance;
                    user.games = (user.games || 0) + 1;
                    user.losses = (user.losses || 0) + 1;
                    user.totalLost = (user.totalLost || 0) + playerBet;
                    user.maxBalance = Math.max(user.maxBalance || 0, balance);

                    localStorage.setItem(username, JSON.stringify(user));

                    disablePlayerControls();
                    playerScore = 0;
                    systemScore = 0;
                    turnScore = 0;
                    updateDisplay();

                    document.getElementById("startGame").textContent = "Почати гру";
                    document.getElementById("bet").disabled = false;
                    document.getElementById("diceResult").textContent = "";
                    document.getElementById("turnScore").textContent = "Очки цього ходу: 0";
                }
            } else {
                startGame();
            }
        }

        document.getElementById("goToProfile").addEventListener("click", function () {
            window.location.href = "../users/profile.html";
        });