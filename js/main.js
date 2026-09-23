function MainModule(listingsID = "#listings") {
  const me = {};

  const listingsElement = document.querySelector(listingsID);
  const countElement = document.querySelector("#count");
  const summaryElement = document.querySelector("#plannerSummary");

  const nightsInput = document.querySelector("#nights");
  const guestsInput = document.querySelector("#guests");
  const budgetInput = document.querySelector("#budget");
  const searchInput = document.querySelector("#search");
  const sortSelect = document.querySelector("#sort");
  const onlyFitsCheckbox = document.querySelector("#onlyFits");
  const surpriseButton = document.querySelector("#surprise");
  const plannerForm = document.querySelector("#planner");

  let allListings = [];

  // ---------- Helpers ----------

  function getPrice(listing) {
    if (!listing.price) return null;
    const number = parseFloat(
      listing.price.replace("$", "").replaceAll(",", ""),
    );
    if (isNaN(number)) return null;
    return number;
  }

  function getAmenities(listing) {
    try {
      return JSON.parse(listing.amenities);
    } catch (error) {
      return [];
    }
  }

  function formatMoney(amount) {
    return "$" + Math.round(amount).toLocaleString();
  }

  // ---------- Trip planner ----------

  function getTrip() {
    let nights = parseInt(nightsInput.value);
    let guests = parseInt(guestsInput.value);
    let budget = parseFloat(budgetInput.value);

    if (isNaN(nights) || nights < 1) nights = 1;
    if (isNaN(guests) || guests < 1) guests = 1;
    if (isNaN(budget) || budget <= 0) budget = null;

    return { nights: nights, guests: guests, budget: budget };
  }

  function checkTrip(listing, trip) {
    const price = getPrice(listing);
    if (price === null) {
      return { total: null, fits: false, message: "Price not listed" };
    }

    const total = price * trip.nights;
    const perPerson = total / trip.guests;
    const sleepsEnough = listing.accommodates >= trip.guests;
    const withinBudget = trip.budget === null || total <= trip.budget;

    let message;
    if (!sleepsEnough) {
      message = "Sleeps only " + listing.accommodates;
    } else if (!withinBudget) {
      message = formatMoney(total - trip.budget) + " over budget";
    } else if (trip.budget !== null) {
      message = "Fits, " + formatMoney(trip.budget - total) + " left over";
    } else {
      message = "Fits your group";
    }

    return {
      total: total,
      perPerson: perPerson,
      fits: sleepsEnough && withinBudget,
      message: message,
    };
  }

  // ---------- Card markup ----------

  function getAmenitiesCode(listing) {
    const amenities = getAmenities(listing);
    if (amenities.length === 0) {
      return "<p class=\"text-body-secondary small\">No amenities listed.</p>";
    }

    const first = amenities.slice(0, 6);
    const rest = amenities.slice(6);

    let code = "";
    for (let amenity of first) {
      code += `<span class="badge text-bg-light border me-1 mb-1">${amenity}</span>`;
    }

    if (rest.length > 0) {
      let restCode = "";
      for (let amenity of rest) {
        restCode += `<span class="badge text-bg-light border me-1 mb-1">${amenity}</span>`;
      }
      code += `
        <div class="collapse" id="amenities-${listing.id}">${restCode}</div>
        <button class="btn btn-link btn-sm p-0" type="button"
          data-bs-toggle="collapse" data-bs-target="#amenities-${listing.id}">
          Show all ${amenities.length} amenities
        </button>`;
    }
    return code;
  }

  function getTripCode(listing, trip) {
    const result = checkTrip(listing, trip);
    if (result.total === null) {
      return `<div class="alert alert-secondary py-2 mb-0">${result.message}</div>`;
    }

    const alertColor = result.fits ? "alert-success" : "alert-danger";
    return `
      <div class="alert ${alertColor} py-2 mb-0">
        <strong>${formatMoney(result.total)}</strong> for ${trip.nights} night(s)<br />
        <span class="small">${formatMoney(result.perPerson)} per person with ${trip.guests} guest(s)</span><br />
        <strong class="small">${result.message}</strong>
      </div>`;
  }

  function getListingCode(listing, trip) {
    const price = getPrice(listing);

    let priceText = "Price not listed";
    if (price !== null) priceText = formatMoney(price) + " / night";

    let ratingText = "No reviews yet";
    if (listing.review_scores_rating) {
      ratingText = `★ ${listing.review_scores_rating} (${listing.number_of_reviews} reviews)`;
    }

    let superhostBadge = "";
    if (listing.host_is_superhost === "t") {
      superhostBadge =
        "<span class=\"badge rounded-pill text-bg-dark ms-auto\">Superhost</span>";
    }

    return `<div class="col">
  <div class="listing card h-100" id="listing-${listing.id}">
    <img
      src="${listing.picture_url}"
      class="card-img-top listing-thumb"
      alt="Photo of ${listing.name}"
    />
    <div class="card-body d-flex flex-column gap-3">
      <div>
        <h2 class="h5 card-title mb-1">
          <a href="${listing.listing_url}" target="_blank" class="text-reset">${listing.name}</a>
        </h2>
        <p class="small text-body-secondary mb-0">
          ${listing.neighbourhood_cleansed}, ${listing.room_type}, sleeps ${listing.accommodates}
        </p>
      </div>

      <div class="d-flex justify-content-between align-items-baseline">
        <span class="fs-5 fw-bold">${priceText}</span>
        <span class="small">${ratingText}</span>
      </div>

      ${getTripCode(listing, trip)}

      <div class="d-flex align-items-center gap-2">
        <img
          src="${listing.host_picture_url}"
          class="rounded-circle host-photo"
          alt="Host ${listing.host_name}"
        />
        <div>
          <div class="small text-body-secondary">Hosted by</div>
          <strong>${listing.host_name}</strong>
        </div>
        ${superhostBadge}
      </div>

      <div>
        <h3 class="h6">Description</h3>
        <div class="description small">${listing.description || "No description provided."}</div>
      </div>

      <div>
        <h3 class="h6">Amenities</h3>
        ${getAmenitiesCode(listing)}
      </div>
    </div>
  </div>
</div>
`;
  }

  // ---------- Search, filter and sort ----------

  function getVisibleListings(trip) {
    const search = searchInput.value.trim().toLowerCase();

    let result = allListings.filter(function (listing) {
      const text = [
        listing.name,
        listing.neighbourhood_cleansed,
        listing.host_name,
        getAmenities(listing).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(search);
    });

    if (onlyFitsCheckbox.checked) {
      result = result.filter((listing) => checkTrip(listing, trip).fits);
    }

    const sortBy = sortSelect.value;
    if (sortBy === "priceAsc") {
      result.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortBy === "priceDesc") {
      result.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sortBy === "rating") {
      result.sort(
        (a, b) => (b.review_scores_rating || 0) - (a.review_scores_rating || 0),
      );
    }
    return result;
  }

  // ---------- Rendering ----------

  function redraw() {
    const trip = getTrip();
    const listings = getVisibleListings(trip);

    if (listings.length === 0) {
      listingsElement.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning">
            No stays match these settings. Try a bigger budget, fewer guests or a different search.
          </div>
        </div>`;
    } else {
      listingsElement.innerHTML = listings
        .map((listing) => getListingCode(listing, trip))
        .join("\n");
    }

    countElement.innerHTML = `Showing ${listings.length} of ${allListings.length} listings`;

    const fitCount = allListings.filter(
      (listing) => checkTrip(listing, trip).fits,
    ).length;
    let budgetText = "no budget limit";
    if (trip.budget !== null) budgetText = formatMoney(trip.budget);
    summaryElement.innerHTML = `<strong>${fitCount} of ${allListings.length}</strong> stays fit ${trip.nights} night(s), ${trip.guests} guest(s), ${budgetText}.`;
  }

  function surprise() {
    const trip = getTrip();
    const fitting = allListings.filter(
      (listing) => checkTrip(listing, trip).fits,
    );

    if (fitting.length === 0) {
      summaryElement.innerHTML =
        "Nothing fits yet. Try a bigger budget or fewer nights.";
      return;
    }

    searchInput.value = "";
    redraw();

    const randomIndex = Math.floor(Math.random() * fitting.length);
    const chosen = fitting[randomIndex];
    const card = document.getElementById("listing-" + chosen.id);

    card.classList.add("border-danger", "border-4");
    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // ---------- Data loading ----------

  async function loadData() {
    try {
      const res = await fetch("./data/airbnb_sf_listings_500.json");
      const listings = await res.json();

      allListings = listings.slice(0, 50);

      me.redraw();
    } catch (error) {
      console.error(error);
      listingsElement.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">
            Listings failed to load. Open the page with Live Server or GitHub Pages
            and check that data/airbnb_sf_listings_500.json exists.
          </div>
        </div>`;
    }
  }

  // ---------- Events ----------

  plannerForm.addEventListener("submit", (event) => event.preventDefault());
  nightsInput.addEventListener("input", redraw);
  guestsInput.addEventListener("input", redraw);
  budgetInput.addEventListener("input", redraw);
  searchInput.addEventListener("input", redraw);
  sortSelect.addEventListener("change", redraw);
  onlyFitsCheckbox.addEventListener("change", redraw);
  surpriseButton.addEventListener("click", surprise);

  me.redraw = redraw;
  me.loadData = loadData;

  return me;
}

const main = MainModule();

main.loadData();
