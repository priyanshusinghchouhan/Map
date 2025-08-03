const map = L.map("map").setView([20.5937, 78.9629], 5); // Centered on India

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let isFormOpen = false; // Track if the form is currently open
let currentPopup = null;

map.on("click", (e) => {
  const { lat, lng } = e.latlng;

  if (isFormOpen && currentPopup) {
    map.closePopup(currentPopup);
    isFormOpen = false;
    return;
  }

  const formhtml = `
        <form id="popupForm" class = "popup-form">
            <label>Title : <input type="text" id="title"/></label>
            <label>Description : <input type="text" id="description"/></label>
             <label>Category: 
               <select id="category">
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="travel">Travel</option>
                    <option value="food">Food</option>
                    <option value="fun">Fun</option>
              </select>
             </label>
            <button type="submit">Save</button>
        </form>
    `;

  currentPopup = L.popup()
    .setLatLng([lat, lng])
    .setContent(formhtml)
    .openOn(map);

  isFormOpen = true;

  // 🔥 Wait for DOM to mount popup form before attaching listener
  setTimeout(() => {
    const popupForm = document.getElementById("popupForm");
    if (!popupForm) return;

    popupForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = document.getElementById("title").value;
      const description = document.getElementById("description").value;
      const category = document.getElementById("category").value;

      const titleInput = document.getElementById("title");
      const descInput = document.getElementById("description");

      let hasError = false;

      if (!title) {
        titleInput.style.border = "2px solid red";
        hasError = true;
      } else {
        titleInput.style.border = "";
      }

      if (!description) {
        descInput.style.border = "2px solid red";
        hasError = true;
      } else {
        descInput.style.border = "";
      }

      if (hasError) {
        return;
      }

      const markerId = Date.now().toString(); // unique ID

      const marker = L.marker([lat, lng]).addTo(map);

      const popupHTML = `${getCategoryEmoji(category)} <b>${title}</b><br>${description}<br><i>${category}</i>
                          <br><br>
                          <button type="button" onclick="deleteMarker('${markerId}')">🗑 Delete</button>
                        `;

      marker.bindPopup(popupHTML).openPopup();
      marker._markerId = markerId;
      allMarkers.push(marker);

      map.closePopup();
      isFormOpen = false;

      // Remove red borders when user starts typing
      document.getElementById("title").addEventListener("input", () => {
        document.getElementById("title").style.border = "";
      });
      document.getElementById("description").addEventListener("input", () => {
        document.getElementById("description").style.border = "";
      });

      const savedMarkers = JSON.parse(localStorage.getItem("markers")) || [];

      savedMarkers.push({
        id: markerId,
        lat,
        lng,
        title,
        description,
        category,
      });

      localStorage.setItem("markers", JSON.stringify(savedMarkers));
    });
  }, 0); 
});

let allMarkers = [];

window.addEventListener("DOMContentLoaded", () => {
  const savedMarkers = JSON.parse(localStorage.getItem("markers")) || [];

  savedMarkers.forEach(({ id, lat, lng, title, description, category }) => {
    const marker = L.marker([lat, lng]).addTo(map);

    const popupHTML = `
      ${getCategoryEmoji(
        category
      )} <b>${title}</b><br>${description}<br><i>${category}</i>
      <br><br>
      <button type="button" onclick="deleteMarker('${id}')">🗑 Delete</button>
    `;

    marker.bindPopup(popupHTML);

    marker._markerId = id;
    allMarkers.push(marker);
  });
});

const clearBtn = document.getElementById("clearMarkersBtn");

clearBtn.addEventListener("click", () => {
  localStorage.removeItem("markers");
  location.reload(); 
});

function deleteMarker(id) {
  const markerToRemove = allMarkers.find((m) => m._markerId === id);
  if (markerToRemove) {
    map.removeLayer(markerToRemove);
  }

  const savedMarkers = JSON.parse(localStorage.getItem("markers")) || [];
  const updated = savedMarkers.filter((marker) => marker.id !== id);
  localStorage.setItem("markers", JSON.stringify(updated));
}

function getCategoryEmoji(category) {
  switch (category.toLowerCase()) {
    case "home":
      return "🏠";
    case "work":
      return "💼";
    case "travel":
      return "✈️";
    case "food":
      return "🍔";
    case "fun":
      return "🎉";
    default:
      return "📍";
  }
}
