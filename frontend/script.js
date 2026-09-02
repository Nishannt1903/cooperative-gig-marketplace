// ==================================================
// API
// ==================================================

const API_URL = "http://192.168.6.127:5000/api";


// ==================================================
// GLOBAL VARIABLES
// ==================================================

let currentUser = JSON.parse(localStorage.getItem("currentUser"));

let selectedRating = 0;
let selectedGigForRating = null;


// ==================================================
// PAGE CONTROL
// ==================================================

function showPage(pageId) {

    if (!currentUser && pageId !== "login" && pageId !== "register") {
        showLogin();
        return;
    }

    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("d-none");
    });

    document.getElementById(pageId).classList.remove("d-none");

    if (pageId === "home") {
        loadGigs();
    }

    if (pageId === "myGigs") {
        loadMyGigs();
    }
}


// ==================================================
// LOGIN / REGISTER PAGE
// ==================================================

function showLogin() {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("d-none");
    });

    document.getElementById("login").classList.remove("d-none");
}


function showRegister() {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("d-none");
    });

    document.getElementById("register").classList.remove("d-none");
}


// ==================================================
// LOGIN
// ==================================================

document.getElementById("loginForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("loginEmail").value;

    try {

        const response = await fetch(`${API_URL}/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email
            })

        });

        const data = await response.json();

        if (!response.ok) {
            document.getElementById("loginMessage").innerHTML =
                `<div class="alert alert-danger">${data.message}</div>`;
            return;
        }

        currentUser = data.user;

        localStorage.setItem(
            "currentUser",
            JSON.stringify(currentUser)
        );

        updateUserDisplay();

        document.getElementById("loginForm").reset();

        showPage("home");

    } catch (error) {

        document.getElementById("loginMessage").innerHTML =
            `<div class="alert alert-danger">
                Cannot connect to server.
             </div>`;

        console.error(error);
    }

});


// ==================================================
// REGISTER
// ==================================================

document.getElementById("registerForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;

    try {

        const response = await fetch(`${API_URL}/register`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                email: email
            })

        });

        const data = await response.json();

        if (!response.ok) {

            document.getElementById("registerMessage").innerHTML =
                `<div class="alert alert-danger">${data.message}</div>`;

            return;
        }

        currentUser = data.user;

        localStorage.setItem(
            "currentUser",
            JSON.stringify(currentUser)
        );

        updateUserDisplay();

        document.getElementById("registerForm").reset();

        alert("Registration successful!");

        showPage("home");

    } catch (error) {

        document.getElementById("registerMessage").innerHTML =
            `<div class="alert alert-danger">
                Cannot connect to server.
             </div>`;

        console.error(error);
    }

});


// ==================================================
// USER DISPLAY
// ==================================================

function updateUserDisplay() {

    const userDisplay = document.getElementById("userNameDisplay");
    const logoutButton = document.getElementById("logoutButton");

    if (currentUser) {

        userDisplay.textContent =
            `👤 ${currentUser.name}`;

        logoutButton.style.display = "block";

    } else {

        userDisplay.textContent = "";

        logoutButton.style.display = "none";
    }
}


// ==================================================
// LOGOUT
// ==================================================

function logout() {

    localStorage.removeItem("currentUser");

    currentUser = null;

    updateUserDisplay();

    showLogin();
}


// ==================================================
// LOAD GIGS
// ==================================================

async function loadGigs() {

    try {

        const response = await fetch(`${API_URL}/gigs`);

        const gigs = await response.json();

        const container =
            document.getElementById("gigContainer");

        container.innerHTML = "";

        if (gigs.length === 0) {

            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        No gigs available yet. Be the first to post one!
                    </div>
                </div>
            `;

            return;
        }

        gigs.forEach(gig => {

            if (gig.status === "AVAILABLE") {

                container.innerHTML += createGigCard(gig);

            }

        });

    } catch (error) {

        console.error(error);

        document.getElementById("gigContainer").innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    Unable to load gigs. Check the backend server.
                </div>
            </div>
        `;
    }
}


// ==================================================
// GIG CARD
// ==================================================

function createGigCard(gig) {

    return `
        <div class="col-md-6 col-lg-4">

            <div class="card gig-card shadow-sm h-100">

                <div class="card-body">

                    <h5 class="card-title">
                        ${gig.title}
                    </h5>

                    <p class="text-muted">
                        ${gig.description}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${gig.category}
                    </p>

                    <p>
                        📍 ${gig.location}
                    </p>

                    <p>
                        📅 Deadline:
                        ${gig.deadline || "Not specified"}
                    </p>

                    <p class="reward">
                        ₹${gig.reward}
                    </p>

                    <span class="badge bg-success">
                        ${gig.status}
                    </span>

                    <div class="mt-3">

                        <button
                            class="btn btn-outline-primary btn-sm"
                            onclick="viewGig(${gig.id})">

                            View Details

                        </button>

                        <button
                            class="btn btn-primary btn-sm ms-2"
                            onclick="acceptGig(${gig.id})">

                            Accept Gig

                        </button>

                    </div>

                </div>

            </div>

        </div>
    `;
}


// ==================================================
// VIEW GIG
// ==================================================

async function viewGig(id) {

    try {

        const response =
            await fetch(`${API_URL}/gigs/${id}`);

        const gig = await response.json();

        const container =
            document.getElementById("detailsContainer");

        container.innerHTML = `

            <div class="form-container">

                <h2>${gig.title}</h2>

                <p>${gig.description}</p>

                <hr>

                <p>
                    <strong>Category:</strong>
                    ${gig.category}
                </p>

                <p>
                    <strong>Location:</strong>
                    ${gig.location}
                </p>

                <p>
                    <strong>Reward:</strong>
                    ₹${gig.reward}
                </p>

                <p>
                    <strong>Deadline:</strong>
                    ${gig.deadline || "Not specified"}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${gig.status}
                </p>

                ${
                    gig.status === "AVAILABLE"
                    ?
                    `
                    <button
                        class="btn btn-primary"
                        onclick="acceptGig(${gig.id})">
                        Accept Gig
                    </button>
                    `
                    :
                    ""
                }

                <button
                    class="btn btn-secondary ms-2"
                    onclick="showPage('home')">
                    Back
                </button>

            </div>
        `;

        showPage("gigDetails");

    } catch (error) {

        console.error(error);

        alert("Unable to load gig details.");
    }
}


// ==================================================
// ACCEPT GIG
// ==================================================

async function acceptGig(id) {

    if (!currentUser) {

        showLogin();

        return;
    }

    try {

        const response =
            await fetch(`${API_URL}/gigs/${id}/accept`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    user_id: currentUser.id
                })

            });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);

            return;
        }

        alert("Gig accepted successfully! 🎉");

        showPage("myGigs");

    } catch (error) {

        console.error(error);

        alert("Unable to accept gig.");
    }
}


// ==================================================
// POST GIG
// ==================================================

document.getElementById("gigForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    if (!currentUser) {

        showLogin();

        return;
    }

    const gigData = {

        title: document.getElementById("title").value,

        description:
            document.getElementById("description").value,

        category:
            document.getElementById("category").value,

        location:
            document.getElementById("location").value,

        reward:
            Number(document.getElementById("reward").value),

        deadline:
            document.getElementById("deadline").value,

        posted_by:
            currentUser.id
    };


    try {

        const response =
            await fetch(`${API_URL}/gigs`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(gigData)

            });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);

            return;
        }

        alert("Gig posted successfully! 🎉");

        document.getElementById("gigForm").reset();

        showPage("home");

    } catch (error) {

        console.error(error);

        alert("Unable to post gig.");
    }

});


// ==================================================
// MY GIGS
// ==================================================

async function loadMyGigs() {

    try {

        const response =
            await fetch(`${API_URL}/gigs`);

        const gigs = await response.json();

        const container =
            document.getElementById("myGigsContainer");

        container.innerHTML = "";

        const myGigs = gigs.filter(gig =>
            gig.posted_by === currentUser.id ||
            gig.accepted_by === currentUser.id
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

            let actionButton = "";

            if (
                gig.status === "ACCEPTED" &&
                gig.accepted_by === currentUser.id
            ) {

                actionButton = `
                    <button
                        class="btn btn-success btn-sm"
                        onclick="completeGig(${gig.id})">
                        Mark Completed
                    </button>
                `;

            }


            if (
                gig.status === "COMPLETED"
            ) {

                actionButton = `
                    <button
                        class="btn btn-primary btn-sm"
                        onclick="openRating(${gig.id})">
                        ⭐ Rate
                    </button>
                `;

            }


            container.innerHTML += `

                <div class="col-md-6 col-lg-4">

                    <div class="card gig-card shadow-sm h-100">

                        <div class="card-body">

                            <h5>
                                ${gig.title}
                            </h5>

                            <p>
                                ${gig.description}
                            </p>

                            <p class="reward">
                                ₹${gig.reward}
                            </p>

                            <p>
                                Status:
                                <strong>
                                    ${gig.status}
                                </strong>
                            </p>

                            <div>
                                ${actionButton}
                            </div>

                        </div>

                    </div>

                </div>
            `;

        });

    } catch (error) {

        console.error(error);

        alert("Unable to load your gigs.");
    }
}


// ==================================================
// COMPLETE GIG
// ==================================================

async function completeGig(id) {

    try {

        const response =
            await fetch(`${API_URL}/gigs/${id}/complete`, {

                method: "POST"
            });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);

            return;
        }

        alert("Gig marked as completed! 🎉");

        selectedGigForRating = data.gig;

        selectedRating = 0;

        document.getElementById("ratingComment").value = "";

        resetStars();

        showPage("rating");

    } catch (error) {

        console.error(error);

        alert("Unable to complete gig.");
    }
}


// ==================================================
// RATING
// ==================================================

function openRating(id) {

    selectedGigForRating = {
        id: id
    };

    selectedRating = 0;

    document.getElementById("ratingComment").value = "";

    resetStars();

    showPage("rating");
}


function selectRating(value) {

    selectedRating = value;

    const stars =
        document.querySelectorAll(".stars span");

    stars.forEach((star, index) => {

        if (index < value) {

            star.textContent = "★";

        } else {

            star.textContent = "☆";

        }

    });
}


function resetStars() {

    const stars =
        document.querySelectorAll(".stars span");

    stars.forEach(star => {

        star.textContent = "☆";

    });
}


async function submitRating() {

    if (!selectedGigForRating) {

        alert("No gig selected for rating.");

        return;
    }

    if (selectedRating === 0) {

        alert("Please select a rating.");

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/gigs/${selectedGigForRating.id}/rating`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        from_user: currentUser.id,

                        // Rate the other person
                        to_user:
                            selectedGigForRating.posted_by === currentUser.id
                            ? selectedGigForRating.accepted_by
                            : selectedGigForRating.posted_by,

                        rating: selectedRating,

                        comment:
                            document.getElementById("ratingComment").value

                    })

                }
            );


        const data = await response.json();

        if (!response.ok) {

            alert(data.message);

            return;
        }

        alert("Rating submitted successfully! ⭐");

        selectedGigForRating = null;

        showPage("home");

    } catch (error) {

        console.error(error);

        alert("Unable to submit rating.");
    }
}


// ==================================================
// START APPLICATION
// ==================================================

updateUserDisplay();

if (currentUser) {

    showPage("home");

} else {

    showLogin();

}