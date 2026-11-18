// Demo login: nothing is verified or stored. A real login needs a backend.

function login() {
  const name = document.getElementById("l-name").value.trim();
  const phone = document.getElementById("l-phone").value.trim();
  const role = document.getElementById("l-role").value;

  if (name === "" || phone.length < 6) {
    document.getElementById("l-error").textContent = "Enter your name and a phone number.";
    return;
  }

  document.getElementById("l-error").textContent = "";
  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "grid";
  document.getElementById("who").textContent = name + " · " + role;

  showScreen(role === "Driver" ? 2 : 1);
}

function logout() {
  document.getElementById("app").style.display = "none";
  document.getElementById("login").style.display = "flex";
}

// ---------- Summary cards at the top of the dashboard ----------
function updateStats() {
  const box = document.getElementById("stats");
  if (!box) return;
  const matched = getMatched();
  const kg = totalKg(matched);
  const pct = Math.round(kg / driver.capacityKg * 100);
  const avg = matched.length ? "₹" + Math.round(driver.quote / matched.length) : "–";

  box.innerHTML =
    '<div class="stat"><span class="n">' + matched.length + '</span><span class="l">Loads grouped · ' + driver.routeName + '</span></div>' +
    '<div class="stat"><span class="n">' + kg + ' kg</span><span class="l">of ' + driver.capacityKg + ' kg truck</span>' +
      '<div class="mini"><div style="width:' + pct + '%"></div></div></div>' +
    '<div class="stat"><span class="n">' + avg + '</span><span class="l">Average share each</span></div>' +
    '<div class="stat"><span class="n s">' + driver.tripStatus + '</span><span class="l">Trip status</span></div>';
}

// run updateStats every time a screen is drawn
const drawScreen = showScreen;
showScreen = function (n) {
  drawScreen(n);
  updateStats();
};