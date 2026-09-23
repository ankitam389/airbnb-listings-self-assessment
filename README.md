# SF Airbnb Listings

A JavaScript and DOM self-assessment project that loads Airbnb listing data from a local JSON file and dynamically displays the first 50 San Francisco listings.

## Features

- Loads Airbnb listing data using `fetch()` and `async/await`
- Displays the first 50 listings from the JSON file
- Shows for every listing:
  - Listing name (links to the listing on Airbnb)
  - Description
  - Amenities
  - Host name
  - Host photo
  - Price
  - Listing thumbnail
- Responsive layout using Bootstrap
- Creative feature: a trip planner
  - Enter the number of nights, guests and your total budget
  - Every card shows the total cost of the trip and the cost per person
  - Cards turn green when the stay fits your trip and red when it is over budget or too small for your group
  - A summary shows how many of the 50 stays fit
- Supporting tools:
  - Search by name, neighborhood, host or amenity
  - Sort by price (low to high, high to low) or rating
  - Filter to show only stays that fit the trip
  - "Pick one for me" chooses a random stay that fits and highlights it

## Technologies Used

- HTML
- CSS
- JavaScript (ES6)
- Bootstrap 5
- Fetch API
- DOM manipulation
- GitHub Pages

## How It Works

The project uses the Fetch API with `async/await` to load Airbnb data from a local JSON file. The first 50 listings are selected with `slice(0, 50)` and rendered into the page by building HTML with template strings and assigning it to the container's `innerHTML`.

Each listing card displays the required information: the listing name, description, amenities, host name and photo, price and thumbnail. Amenities arrive from the dataset as a JSON string, so they are parsed into an array, and the first six are shown with a Bootstrap collapse button revealing the rest. Prices arrive as text such as `"$187.00"` and are parsed into numbers so they can be used in calculations and sorting.

The trip planner reads the nights, guests and budget inputs, multiplies the nightly price by the number of nights to get the trip total, divides by the number of guests for the per-person cost, and compares the total against the budget and the listing's capacity against the guest count. Event listeners on the planner, search, sort and filter controls call `redraw()` whenever a value changes, so the whole page updates immediately.

The code keeps the revealing module pattern from the in-class demo: `MainModule()` returns an object exposing `loadData()` and `redraw()`, with the helper functions kept private inside it.

## Run Locally

Clone the repository:

```bash
git clone https://github.com/ankitam389/airbnb-listings-self-assessment.git
```

Move into the project folder:

```bash
cd airbnb-listings-self-assessment
```

Start a local server:

```bash
python3 -m http.server 8080
```

Open the following URL in your browser:

```
http://localhost:8080
```

A local server is required. The page loads its data with `fetch()`, which browsers block on `file://` pages, so opening `index.html` by double-clicking it shows an error instead of the listings.

## Deployment

Live website: https://ankitam389.github.io/airbnb-listings-self-assessment/

GitHub repository: https://github.com/ankitam389/airbnb-listings-self-assessment

## Data

San Francisco listings from [Inside Airbnb](http://insideairbnb.com/), provided for the class in `data/airbnb_sf_listings_500.json`.

## AI Usage

Act as an experienced full-stack engineer and help me create a clear and meaningful README for my SF Airbnb Listings JavaScript and DOM self-assessment project. Include the project purpose, features, technologies used, instructions for running the project locally, deployment information, and license information, along with the creative trip planner feature where the user enters nights, guests and a total budget and every listing shows the trip total, the cost per person and whether the stay fits.

## License

This project is licensed under the MIT License.