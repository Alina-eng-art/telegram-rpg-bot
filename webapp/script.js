let hp = 100;
let attackPower = 10;
let enemyHp = 50;

function update() {
  document.getElementById('hp').innerText = hp;
  document.getElementById('enemy').innerText = enemyHp;
}

function attack() {
  enemyHp -= attackPower;

  if (enemyHp <= 0) {
    enemyHp = 50;
    document.getElementById('log').innerText = "👹 Ворога переможено!";
  } else {
    hp -= 5;
    document.getElementById('log').innerText = "⚔️ Бій триває!";
  }

  if (hp <= 0) {
    hp = 100;
    document.getElementById('log').innerText = "💀 Ти загинув і відродився!";
  }

  update();
}

function heal() {
  hp += 10;
  if (hp > 100) hp = 100;

  document.getElementById('log').innerText = "❤️ Ти вилікувався!";
  update();
}

update();
