// ==========================================
// DEMO USER
// ==========================================

const currentUser = {
    id: 1,
    name: "Siddhesh"
};


// ==========================================
// DEMO GIG DATA
// ==========================================

let gigs = [

    {
        id: 1,
        title: "Grocery Pickup",
        description: "Need someone to collect groceries from a nearby shop.",
        category: "Household",
        location: "Ambarnath",
        reward: 200,
        deadline: "2026-09-03",
        postedBy: "Rahul",
        postedById: 2,
        acceptedBy: null,
        status: "AVAILABLE"
    },

    {
        id: 2,
        title: "Move Furniture",
        description: "Need help moving a table from first floor to ground floor.",
        category: "Household",
        location: "Ambarnath",
        reward: 300,
        deadline: "2026-09-04",
        postedBy: "Amit",
        postedById: 3,
        acceptedBy: null,
        status: "AVAILABLE"
    },

    {
        id: 3,
        title: "Community Garden Help",
        description: "Need help watering plants in our community garden.",
        category: "Community",
        location: "Ambarnath",
        reward: 150,
        deadline: "2026-09-03",
        postedBy: "Neha",
        postedById: 4,
        acceptedBy: null,
        status: "AVAILABLE"
    }

];


// ==========================================
// SHOW PAGE
// ==========================================

function showPage(pageId) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.add("d-none");
    });

    document.getElementById(pageId).classList.remove("d-none");


    if (pageId === "home") {
        displayGigs();
    }

    if (pageId === "myGigs") {
        displayMyGigs();
    }

}


// ==========================================
// DISPLAY AVAILABLE GIGS
// ==========================================

function displayGigs() {

    const container = document.getElementById("gigContainer");

    container.innerHTML = "";


    const availableGigs =
        gigs.filter(gig => gig.status === "AVAILABLE");


    if (availableGigs.length === 0) {

        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    No gigs available right now.
                </div>
            </div>
        `;

        return;
    }


    availableGigs.forEach(gig => {

        container.innerHTML += `

            <div class="col-md-4">

                <div class="card gig-card shadow-sm h-100">

                    <div class="card-body">

                        <span class="badge bg-secondary">
                            ${gig.category}
                        </span>

                        <h4 class="mt-3">
                            ${gig.title}
                        </h4>

                        <p class="text-muted">
                            ${gig.description}
                        </p>

                        <p>
                            📍 ${gig.location}
                        </p>

                        <p>
                            📅 ${gig.deadline}
                        </p>

                        <p class="reward">
                            ₹${gig.reward}
                        </p>

                        <p>
                            Posted by: ${gig.postedBy}
                        </p>

                        <button
                            class="btn btn-primary w-100"
                            onclick="viewGig(${gig.id})">

                            View & Accept

                        </button>

                    </div>

                </div>

            </div>

        `;

    });

}


// ==========================================
// VIEW GIG
// ==========================================

function viewGig(id) {

    const gig = gigs.find(g => g.id === id);

    if (!gig) return;


    const container =
        document.getElementById("detailsContainer");


    container.innerHTML = `

        <div class="card shadow-sm">

            <div class="card-body p-4">

                <span class="badge bg-secondary">
                    ${gig.category}
                </span>

                <h1 class="mt-3">
                    ${gig.title}
                </h1>

                <h3 class="text-primary">
                    ₹${gig.reward}
                </h3>

                <hr>

                <p>
                    <strong>📍 Location:</strong>
                    ${gig.location}
                </p>

                <p>
                    <strong>📅 Deadline:</strong>
                    ${gig.deadline}
                </p>

                <p>
                    <strong>Posted by:</strong>
                    ${gig.postedBy}
                </p>

                <h5 class="mt-4">
                    Description
                </h5>

                <p>
                    ${gig.description}
                </p>

                <p class="status status-${gig.status.toLowerCase()}">
                    Status: ${gig.status}
                </p>


                ${
                    gig.status === "AVAILABLE"

                    ?

                    `<button
                        class="btn btn-success"
                        onclick="acceptGig(${gig.id})">

                        Accept Gig

                    </button>`

                    :

                    `<button
                        class="btn btn-secondary"
                        disabled>

                        ${gig.status}

                    </button>`
                }


                <button
                    class="btn btn-outline-secondary ms-2"
                    onclick="showPage('home')">

                    Back

                </button>

            </div>

        </div>

    `;


    showPage("gigDetails");

}


// ==========================================
// ACCEPT GIG
// ==========================================

function acceptGig(id) {

    const gig = gigs.find(g => g.id === id);

    if (!gig) return;


    gig.acceptedBy = currentUser.name;

    gig.acceptedById = currentUser.id;

    gig.status = "ACCEPTED";


    alert("Gig accepted successfully!");


    displayMyGigs();

    showPage("myGigs");

}


// ==========================================
// POST NEW GIG
// ==========================================

document
    .getElementById("gigForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const newGig = {

            id: Date.now(),

            title:
                document.getElementById("title").value,

            description:
                document.getElementById("description").value,

            category:
                document.getElementById("category").value,

            location:
                document.getElementById("location").value,

            reward:
                document.getElementById("reward").value,

            deadline:
                document.getElementById("deadline").value,

            postedBy:
                currentUser.name,

            postedById:
                currentUser.id,

            acceptedBy: null,

            status: "AVAILABLE"

        };


        gigs.push(newGig);


        alert("Gig posted successfully!");


        this.reset();


        showPage("home");

    });


// ==========================================
// MY GIGS
// ==========================================

function displayMyGigs() {

    const container =
        document.getElementById("myGigsContainer");


    container.innerHTML = "";


    const myGigs = gigs.filter(gig =>

        gig.postedById === currentUser.id ||
        gig.acceptedById === currentUser.id

    );


    if (myGigs.length === 0) {

        container.innerHTML = `

            <div class="col-12">

                <div class="alert alert-info">

                    You don't have any gigs yet.

                </div>

            </div>

        `;

        return;
    }


    myGigs.forEach(gig => {

        container.innerHTML += `

            <div class="col-md-6">

                <div class="card shadow-sm">

                    <div class="card-body">

                        <h4>
                            ${gig.title}
                        </h4>

                        <p>
                            💰 ₹${gig.reward}
                        </p>

                        <p>
                            📍 ${gig.location}
                        </p>

                        <p class="status status-${gig.status.toLowerCase()}">

                            Status: ${gig.status}

                        </p>


                        ${
                            gig.acceptedBy

                            ?

                            `<p>
                                Worker:
                                <strong>
                                    ${gig.acceptedBy}
                                </strong>
                            </p>`

                            :

                            ""
                        }


                        ${
                            gig.postedById === currentUser.id &&
                            gig.status === "ACCEPTED"

                            ?

                            `<button
                                class="btn btn-success"
                                onclick="completeGig(${gig.id})">

                                Mark Completed

                            </button>`

                            :

                            ""
                        }


                        ${
                            gig.status === "COMPLETED"

                            ?

                            `<span class="badge bg-success">
                                Completed ✓
                            </span>`

                            :

                            ""
                        }

                    </div>

                </div>

            </div>

        `;

    });

}


// ==========================================
// COMPLETE GIG
// ==========================================

function completeGig(id) {

    const gig = gigs.find(g => g.id === id);

    if (!gig) return;


    gig.status = "COMPLETED";


    alert("Gig marked as completed!");


    displayMyGigs();


    showPage("rating");

}


// ==========================================
// RATING
// ==========================================

let selectedRating = 0;


function selectRating(rating) {

    selectedRating = rating;


    const stars =
        document.querySelectorAll(".stars span");


    stars.forEach((star, index) => {

        star.textContent =
            index < rating ? "★" : "☆";

    });

}


function submitRating() {

    if (selectedRating === 0) {

        alert("Please select a rating.");

        return;

    }


    alert(
        `Thank you! You gave ${selectedRating} stars.`
    );


    selectedRating = 0;


    document.getElementById("ratingComment").value = "";


    showPage("home");

}


// ==========================================
// INITIAL LOAD
// ==========================================

displayGigs();