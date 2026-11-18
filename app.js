// DEMO DATA: all names, numbers and places are fictional

const routes = [
  {
    routeName: "Puttur → Mangaluru",
    stops: ["Puttur", "Uppinangady", "Bantwal"],
    destination: "Mangaluru Central Market",
    name: "Naveen (demo)", phone: "98450 11111", vehicleNo: "KA-21 DEMO 1111",
    vehicleType: "Pickup truck", capacityKg: 500, cargoType: "vegetables",
    startHour: 4, endHour: 6, quote: 1200
  },
  {
    routeName: "Thokkottu → Mangaluru",
    stops: ["Thokkottu", "Ullal", "Kotekar"],
    destination: "Mangaluru Central Market",
    name: "Mahesh (demo)", phone: "98450 00000", vehicleNo: "KA-19 DEMO 0000",
    vehicleType: "Mini truck", capacityKg: 350, cargoType: "vegetables",
    startHour: 5, endHour: 7, quote: 900
  }
];

// each route keeps its own trip progress
routes.forEach(r => {
  r.defaultQuote = r.quote;
  r.approved = {};
  r.quoteConfirmed = false;
  r.tripStatus = "Confirmed";
});

let driver = routes[0];   // the currently selected route and truck

let sellers = [
  { id: 1, name: "Ravi", pickup: "Kotekar", produce: "Tomatoes", kg: 100, destination: "Mangaluru Central Market", startHour: 5, endHour: 7 },
  { id: 2, name: "Lakshmi", pickup: "Thokkottu", produce: "Beans", kg: 100, destination: "Mangaluru Central Market", startHour: 5, endHour: 7 },
  { id: 3, name: "Suresh", pickup: "Ullal", produce: "Brinjal", kg: 100, destination: "Mangaluru Central Market", startHour: 4, endHour: 6 },
  { id: 4, name: "Kiran", pickup: "Puttur", produce: "Tomatoes", kg: 200, destination: "Mangaluru Central Market", startHour: 4, endHour: 6 },
  { id: 5, name: "Divya", pickup: "Uppinangady", produce: "Beans", kg: 150, destination: "Mangaluru Central Market", startHour: 4, endHour: 6 },
  { id: 6, name: "Harish", pickup: "Bantwal", produce: "Leafy greens", kg: 100, destination: "Mangaluru Central Market", startHour: 4, endHour: 6 }
];

const vegetables = ["Tomatoes", "Beans", "Brinjal", "Leafy greens"];
const produceOptions = ["Tomatoes", "Beans", "Brinjal", "Leafy greens", "Fresh fish"];
const placeOptions = ["Puttur", "Uppinangady", "Bantwal", "Thokkottu", "Ullal", "Kotekar", "Farangipete"];
const destinationOptions = ["Mangaluru Central Market", "Udupi Market"];
const statuses = ["Confirmed", "Picked up", "On the road", "Delivered"];

let nextId = 7;
let current = 1;

// ---------- MATCHING LOGIC ----------

function timeOverlap(s) {
  return s.startHour < driver.endHour && s.endHour > driver.startHour;
}

// which route could carry this seller? (pickup on its stops, same destination)
function routeFor(s) {
  const r = routes.find(r => r.stops.includes(s.pickup) && r.destination === s.destination);
  return r ? r.routeName : "No route yet";
}

// check every seller against the SELECTED route
function evaluate() {
  let used = 0;
  return sellers.map(s => {
    const c = {
      pickup: driver.stops.includes(s.pickup),
      destination: s.destination === driver.destination,
      time: timeOverlap(s),
      cargo: vegetables.includes(s.produce),
      capacity: false
    };
    if (c.pickup && c.destination && c.time && c.cargo && used + s.kg <= driver.capacityKg) {
      c.capacity = true;
      used += s.kg;
    }
    return { s: s, c: c, ok: c.pickup && c.destination && c.time && c.cargo && c.capacity };
  });
}

// matched sellers, listed in the order the truck passes their pickups
function getMatched() {
  return evaluate().filter(r => r.ok).map(r => r.s)
    .sort((a, b) => driver.stops.indexOf(a.pickup) - driver.stops.indexOf(b.pickup));
}

function totalKg(list) {
  return list.reduce((sum, s) => sum + s.kg, 0);
}

function shareOf(s) {
  const matched = getMatched();
  return Math.round(driver.quote * s.kg / totalKg(matched));
}

function equalLoads(list) {
  return list.every(s => s.kg === list[0].kg);
}

const tick = ok => (ok ? '<span class="ok">✓</span>' : '<span class="no">✗</span>');
const hours = s => s.startHour + "-" + s.endHour + " AM";
const routeText = () => driver.stops.join(" → ") + " → " + driver.destination;

function resetAll() {
  routes.forEach(r => {
    r.approved = {};
    r.quoteConfirmed = false;
    r.tripStatus = "Confirmed";
  });
}

// dropdown that lets the user pick the route
function routeBar() {
  return `<div class="routebar"><label for="route-pick">Select route</label>
    <select id="route-pick" onchange="selectRoute(this.value)">
    ${routes.map((r, i) => `<option value="${i}" ${r === driver ? "selected" : ""}>${r.routeName}</option>`).join("")}
    </select></div>`;
}

function selectRoute(i) {
  driver = routes[i];
  showScreen(current);
}

// ---------- SCREENS ----------

function showScreen(n) {
  current = n;
  const box = document.getElementById("screen");
  const matched = getMatched();
  let html = "";

  document.querySelectorAll("nav button").forEach((b, i) => {
    b.classList.toggle("on", i + 1 === n);
  });

  // 1. Seller booking
  if (n === 1) {
    html = "<h2>Seller booking</h2><p>A seller submits a transport request. The system suggests a route.</p>";
    html += "<table><tr><th>Seller</th><th>Pickup</th><th>Produce</th><th>Kg</th><th>Destination</th><th>Window</th><th>Suggested route</th></tr>";
    for (const s of sellers) {
      html += `<tr><td>${s.name}</td><td>${s.pickup}</td><td>${s.produce}</td><td>${s.kg}</td><td>${s.destination}</td><td>${hours(s)}</td><td>${routeFor(s)}</td></tr>`;
    }
    html += "</table>";
    html += `<h3>Add a request</h3><div class="form">
      <div><label>Seller name</label><input id="f-name" value="Anita"></div>
      <div><label>Pickup</label><select id="f-pickup">${placeOptions.map(p => `<option>${p}</option>`).join("")}</select></div>
      <div><label>Destination</label><select id="f-dest">${destinationOptions.map(p => `<option>${p}</option>`).join("")}</select></div>
      <div><label>Produce</label><select id="f-produce">${produceOptions.map(p => `<option>${p}</option>`).join("")}</select></div>
      <div><label>Quantity (kg)</label><input id="f-kg" type="number" value="100" min="10"></div>
      <div><label>Window starts (AM)</label><input id="f-start" type="number" value="5" min="0" max="23"></div>
      <div><label>Window ends (AM)</label><input id="f-end" type="number" value="7" min="1" max="24"></div>
    </div>
    <button class="btn" onclick="addSeller()">Add request</button>
    <h3>Available routes</h3>
    <table><tr><th>Route</th><th>Stops</th><th>Truck</th><th>Capacity</th><th>Departure</th></tr>
    ${routes.map(r => `<tr><td>${r.routeName}</td><td>${r.stops.join(", ")}</td><td>${r.vehicleType}</td><td>${r.capacityKg} kg</td><td>${r.startHour}-${r.endHour} AM</td></tr>`).join("")}</table>
    <p class="note">Try fresh fish, Farangipete as the pickup, or Udupi Market as the destination to see how matching decides.</p>`;
  }

  // 2. Driver and truck
  if (n === 2) {
    html = `<h2>Driver and truck</h2>${routeBar()}
      <p>The operator lists a trip that is already happening, including spare capacity.</p>
      <table>
        <tr><th>Driver</th><td>${driver.name}</td></tr>
        <tr><th>Phone</th><td>${driver.phone}</td></tr>
        <tr><th>Vehicle</th><td>${driver.vehicleType} (${driver.vehicleNo})</td></tr>
        <tr><th>Route</th><td>${routeText()}</td></tr>
        <tr><th>Free capacity</th><td>${driver.capacityKg} kg</td></tr>
        <tr><th>Carries</th><td>${driver.cargoType} (no fish)</td></tr>
        <tr><th>Departure</th><td>${driver.startHour}-${driver.endHour} AM</td></tr>
      </table>`;
  }

  // 3. Matching
  if (n === 3) {
    html = `<h2>Matching</h2>${routeBar()}<p>We check pickup, destination, time window, cargo type and capacity, not just distance.</p>`;
    html += "<table><tr><th>Seller</th><th>Load</th><th>Pickup</th><th>Dest.</th><th>Time</th><th>Cargo</th><th>Capacity</th><th>Result</th></tr>";
    for (const r of evaluate()) {
      const result = r.ok
        ? '<span class="ok">Grouped</span>'
        : (!r.c.pickup ? '<span class="no">Different route</span>' : '<span class="no">Not on this trip</span>');
      html += `<tr><td>${r.s.name}</td><td>${r.s.kg} kg ${r.s.produce}</td><td>${tick(r.c.pickup)}</td><td>${tick(r.c.destination)}</td><td>${tick(r.c.time)}</td><td>${tick(r.c.cargo)}</td><td>${tick(r.c.capacity)}</td><td>${result}</td></tr>`;
    }
    const kg = totalKg(matched);
    html += `</table>
      <div class="bar"><div style="width:${kg / driver.capacityKg * 100}%"></div></div>
      <p>${matched.length} loads grouped: ${kg} of ${driver.capacityKg} kg used.</p>
      <p class="note">Requests that don't fit would get an individual quote or another departure, never a silent delay.</p>`;
  }

  // 4. Operator confirmation
  if (n === 4) {
    html = `<h2>Operator confirmation</h2>${routeBar()}`;
    if (matched.length === 0) {
      html += "<p>No grouped loads on this route yet. Choose another route or add requests.</p>";
    } else {
      html += `<p>${driver.name} checks whether the combined trip is feasible and sets the price, pickups included.</p>
        <table><tr><th>Seller</th><th>Pickup</th><th>Load</th></tr>
        ${matched.map(s => `<tr><td>${s.name}</td><td>${s.pickup}</td><td>${s.kg} kg ${s.produce}</td></tr>`).join("")}</table>
        <p>Pickup list for the driver: ${matched.map(s => s.pickup).join(" → ")} → ${driver.destination}</p>
        <div class="form"><div><label>Trip price in ₹ (sample quote)</label>
        <input id="f-quote" type="number" min="100" value="${driver.quote}" ${driver.quoteConfirmed ? "disabled" : ""}></div></div>`;
      html += driver.quoteConfirmed
        ? `<p class="ok">Operator confirmed ₹${driver.quote}</p>`
        : `<button class="btn" onclick="confirmQuote()">Confirm vehicle and price</button>`;
    }
  }

  // 5. Seller approval
  if (n === 5) {
    html = `<h2>Seller approval</h2>${routeBar()}`;
    if (!driver.quoteConfirmed) {
      html += "<p>The operator has not confirmed this trip yet. Go to step 4 first.</p>";
    } else {
      html += `<p>Each seller sees their share before agreeing.</p>
        <div class="box">If each seller booked a separate vehicle at ₹600, the total would be ₹${600 * matched.length}. This is an illustration, not a proven saving.</div>
        <table><tr><th>Seller</th><th>Load</th><th>Share</th><th></th></tr>`;
      for (const s of matched) {
        html += `<tr><td>${s.name}</td><td>${s.kg} kg</td><td><strong>₹${shareOf(s)}</strong></td><td>` +
          (driver.approved[s.id] ? '<span class="ok">✓ Agreed</span>' : `<button class="btn" onclick="approve(${s.id})">Agree</button>`) + "</td></tr>";
      }
      html += `</table><p class="note">Split rule in this demo: ${equalLoads(matched) ? "equal loads, so an equal split" : "split by weight"}. A real service would also account for extra pickup distance. No coordination fee is applied in this demo.</p>`;
    }
  }

  // 6. Trip dashboard
  if (n === 6) {
    html = `<h2>Trip dashboard</h2>${routeBar()}`;
    const allAgreed = matched.length > 0 && driver.quoteConfirmed && matched.every(s => driver.approved[s.id]);
    if (!allAgreed) {
      html += "<p>This trip starts once the operator has confirmed and every seller has agreed (steps 4 and 5).</p>";
    } else {
      const idx = statuses.indexOf(driver.tripStatus);
      html += `<p>${driver.routeName} · ${driver.name} · ${driver.vehicleType} ${driver.vehicleNo} · ${driver.phone}</p>
        <div class="steps">${statuses.map((st, i) => `<div class="${i <= idx ? "done" : ""}">${st}</div>`).join("")}</div>`;
      html += driver.tripStatus !== "Delivered"
        ? '<button class="btn" onclick="nextStatus()">Advance status (demo)</button>'
        : `<p class="ok">All loads delivered to ${driver.destination}</p>`;
      html += `<table><tr><th>Seller</th><th>Share</th><th>Status</th></tr>
        ${matched.map(s => `<tr><td>${s.name}</td><td>₹${shareOf(s)}</td><td>${driver.tripStatus}</td></tr>`).join("")}</table>
        <p class="note">In a real pilot we would measure cost per seller, vehicle utilisation, completed trips and on-time delivery.</p>`;
    }
    html += '<button class="btn alt" onclick="restart()">Start over</button>';
  }

  box.innerHTML = html;
}

// ---------- ACTIONS ----------

function addSeller() {
  const kg = parseInt(document.getElementById("f-kg").value, 10);
  const start = parseInt(document.getElementById("f-start").value, 10);
  const end = parseInt(document.getElementById("f-end").value, 10);
  if (!kg || kg < 10 || isNaN(start) || isNaN(end) || end <= start) {
    alert("Enter a quantity of at least 10 kg and an end time after the start time.");
    return;
  }
  sellers.push({
    id: nextId++,
    name: document.getElementById("f-name").value || "Seller",
    pickup: document.getElementById("f-pickup").value,
    produce: document.getElementById("f-produce").value,
    kg: kg,
    destination: document.getElementById("f-dest").value,
    startHour: start,
    endHour: end
  });
  resetAll();
  showScreen(1);
}

function confirmQuote() {
  const q = parseInt(document.getElementById("f-quote").value, 10);
  if (!q || q < 100) { alert("Enter a price of at least ₹100."); return; }
  driver.quote = q;
  driver.quoteConfirmed = true;
  showScreen(4);
}

function approve(id) {
  driver.approved[id] = true;
  showScreen(5);
}

function nextStatus() {
  driver.tripStatus = statuses[statuses.indexOf(driver.tripStatus) + 1];
  showScreen(6);
}

function restart() {
  resetAll();
  routes.forEach(r => { r.quote = r.defaultQuote; });
  showScreen(1);
}

showScreen(1);