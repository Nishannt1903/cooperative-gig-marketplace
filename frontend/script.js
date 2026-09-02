// ==================================================
// API
// ==================================================

const API_URL = "http://192.168.6.127:5000/api";


// ==================================================
// GLOBAL VARIABLES
// ==================================================

let currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || null;

let selectedRating = 0;

let selectedGigForRating = null;


// ==================================================
// PAGE CONTROL
// ==================================================

function showPage(pageId) {

    if (
        !currentUser &&
        pageId !== "login" &&
        pageId !== "register"
    ) {
        showLogin();
        return;
    }


    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.add("d-none");

        });


    const page =
        document.getElementById(pageId);

    if (page) {
        page.classList.remove("d-none");
    }


    if (pageId === "home") {

        const search =
            document.getElementById("searchInput");

        if (search) {
            search.value = "";
        }

        loadGigs();
    }


    if (pageId === "myGigs") {
        loadMyGigs();
    }

}


// ==================================================
// SHOW LOGIN
// ==================================================

function showLogin() {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.add("d-none");

        });


    document
        .getElementById("login")
        .classList.remove("d-none");

}


// ==================================================
// SHOW REGISTER
// ==================================================

function showRegister() {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.add("d-none");

        });


    document
        .getElementById("register")
        .classList.remove("d-none");

}


// ==================================================
// LOGIN
// ==================================================

document
    .getElementById("loginForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const email =
            document
                .getElementById("loginEmail")
                .value
                .trim();


        const phone =
            document
                .getElementById("loginPhone")
                .value
                .trim();


        const role =
            document
                .getElementById("loginRole")
                .value;


        try {

            const response =
                await fetch(`${API_URL}/login`, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        phone,
                        role
                    })

                });


            const data =
                await response.json();


            if (!response.ok) {

                document
                    .getElementById("loginMessage")
                    .innerHTML = `
                        <div class="alert alert-danger">
                            ${data.message}
                        </div>
                    `;

                return;
            }


            currentUser = data.user;


            localStorage.setItem(
                "currentUser",
                JSON.stringify(currentUser)
            );


            updateUserDisplay();


            document
                .getElementById("loginForm")
                .reset();


            document
                .getElementById("loginMessage")
                .innerHTML = "";


            showPage("home");


        } catch (error) {

            console.error(error);


            document
                .getElementById("loginMessage")
                .innerHTML = `
                    <div class="alert alert-danger">
                        Cannot connect to server.
                    </div>
                `;
        }

    });


// ==================================================
// REGISTER
// ==================================================

document
    .getElementById("registerForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const name =
            document
                .getElementById("registerName")
                .value
                .trim();


        const email =
            document
                .getElementById("registerEmail")
                .value
                .trim();


        const phone =
            document
                .getElementById("registerPhone")
                .value
                .trim();


        const role =
            document
                .getElementById("registerRole")
                .value;


        try {

            const response =
                await fetch(`${API_URL}/register`, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        role
                    })

                });


            const data =
                await response.json();


            if (!response.ok) {

                document
                    .getElementById("registerMessage")
                    .innerHTML = `
                        <div class="alert alert-danger">
                            ${data.message}
                        </div>
                    `;

                return;
            }


            document
                .getElementById("registerMessage")
                .innerHTML = `
                    <div class="alert alert-success">
                        Registration successful!
                        Please login.
                    </div>
                `;


            document
                .getElementById("registerForm")
                .reset();


            // Put registered email and role into login
            document
                .getElementById("loginEmail")
                .value = email;


            document
                .getElementById("loginRole")
                .value = role;


            setTimeout(() => {

                showLogin();

            }, 1000);


        } catch (error) {

            console.error(error);


            document
                .getElementById("registerMessage")
                .innerHTML = `
                    <div class="alert alert-danger">
                        Cannot connect to server.
                    </div>
                `;
        }

    });


// ==================================================
// USER DISPLAY
// ==================================================

function updateUserDisplay() {

    const userDisplay =
        document.getElementById(
            "userNameDisplay"
        );


    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    const postGigButton =
        document.getElementById(
            "postGigNavButton"
        );


    const heroPostButton =
        document.getElementById(
            "heroPostButton"
        );


    if (currentUser) {

        userDisplay.textContent =
            `👤 ${currentUser.name} (${currentUser.role})`;


        logoutButton.style.display =
            "block";


        if (currentUser.role === "provider") {

            postGigButton.style.display =
                "block";

            heroPostButton.style.display =
                "inline-block";

        } else {

            postGigButton.style.display =
                "none";

            heroPostButton.style.display =
                "none";

        }

    } else {

        userDisplay.textContent = "";

        logoutButton.style.display =
            "none";

        postGigButton.style.display =
            "none";

        heroPostButton.style.display =
            "none";
    }

}


// ==================================================
// LOGOUT
// ==================================================

function logout() {

    localStorage.removeItem(
        "currentUser"
    );


    currentUser = null;


    updateUserDisplay();


    showLogin();

}


// ==================================================
// LOAD GIGS
// ==================================================

async function loadGigs() {

    try {

        const response =
            await fetch(`${API_URL}/gigs`);


        const gigs =
            await response.json();


        const container =
            document.getElementById(
                "gigContainer"
            );


        container.innerHTML = "";


        const availableGigs =
            gigs.filter(
                gig =>
                    gig.status === "AVAILABLE"
            );


        if (availableGigs.length === 0) {

            container.innerHTML = `
                <div class="col-12">

                    <div class="alert alert-info">

                        No gigs available yet.
                        Be the first to post one!

                    </div>

                </div>
            `;

            return;
        }


        availableGigs.forEach(gig => {

            container.innerHTML +=
                createGigCard(gig);

        });


    } catch (error) {

        console.error(error);


        document
            .getElementById("gigContainer")
            .innerHTML = `
                <div class="col-12">

                    <div class="alert alert-danger">

                        Unable to load gigs.
                        Check the backend server.

                    </div>

                </div>
            `;
    }

}


// ==================================================
// SEARCH GIGS
// ==================================================

async function searchGigs() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    try {

        const response =
            await fetch(`${API_URL}/gigs`);


        const gigs =
            await response.json();


        const container =
            document.getElementById(
                "gigContainer"
            );


        container.innerHTML = "";


        const filteredGigs =
            gigs.filter(gig => {

                if (
                    gig.status !==
                    "AVAILABLE"
                ) {
                    return false;
                }


                const searchableText = `

                    ${gig.title}

                    ${gig.description}

                    ${gig.category}

                    ${gig.location}

                `.toLowerCase();


                return searchableText.includes(
                    searchText
                );

            });


        if (filteredGigs.length === 0) {

            container.innerHTML = `
                <div class="col-12">

                    <div class="alert alert-info">

                        No matching gigs found.

                    </div>

                </div>
            `;

            return;
        }


        filteredGigs.forEach(gig => {

            container.innerHTML +=
                createGigCard(gig);

        });


    } catch (error) {

        console.error(error);


        document
            .getElementById(
                "gigContainer"
            )
            .innerHTML = `
                <div class="col-12">

                    <div class="alert alert-danger">

                        Unable to search gigs.

                    </div>

                </div>
            `;
    }

}


// ==================================================
// CREATE GIG CARD
// ==================================================

function createGigCard(gig) {

    let actionButton = "";


    if (
        currentUser &&
        currentUser.role === "accepter" &&
        gig.status === "AVAILABLE"
    ) {

        actionButton = `

            <button
                class="btn btn-primary btn-sm ms-2"
                onclick="acceptGig(${gig.id})"
            >
                Accept Gig
            </button>

        `;
    }


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
                        <strong>
                            Category:
                        </strong>

                        ${gig.category}
                    </p>


                    <p>
                        📍 ${gig.location}
                    </p>


                    <p>
                        📅 Deadline:

                        ${gig.deadline ||
                            "Not specified"}
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
                            onclick="viewGig(${gig.id})"
                        >
                            View Details
                        </button>

                        ${actionButton}

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
            await fetch(
                `${API_URL}/gigs/${id}`
            );


        const gig =
            await response.json();


        const container =
            document.getElementById(
                "detailsContainer"
            );


        let accepterDetails = "";


        if (
            gig.status === "ACCEPTED" ||
            gig.status === "COMPLETED"
        ) {

            accepterDetails = `

                <hr>

                <div class="alert alert-info">

                    <h5>
                        👤 Accepter Details
                    </h5>

                    <p class="mb-1">
                        <strong>
                            Name:
                        </strong>

                        ${gig.accepter_name}
                    </p>


                    <p class="mb-1">
                        <strong>
                            Email:
                        </strong>

                        ${gig.accepter_email}
                    </p>


                    <p class="mb-0">
                        <strong>
                            Phone:
                        </strong>

                        ${gig.accepter_phone}
                    </p>

                </div>

            `;
        }


        let ratingDetails = "";


        if (gig.rating) {

            const stars =
                "⭐".repeat(
                    Number(gig.rating.rating)
                );


            ratingDetails = `

                <div class="alert alert-warning">

                    <h5>
                        ⭐ Rating & Review
                    </h5>

                    <p class="mb-1">

                        <strong>
                            ${stars}
                        </strong>

                        (${gig.rating.rating}/5)

                    </p>


                    <p class="mb-1">

                        <strong>
                            Reviewed by:
                        </strong>

                        ${gig.rating.from_user_name}

                    </p>


                    <p class="mb-0">

                        <strong>
                            Review:
                        </strong>

                        ${gig.rating.comment ||
                            "No review provided."}

                    </p>

                </div>

            `;
        }


        let acceptButton = "";


        if (
            currentUser &&
            currentUser.role === "accepter" &&
            gig.status === "AVAILABLE"
        ) {

            acceptButton = `

                <button
                    class="btn btn-primary"
                    onclick="acceptGig(${gig.id})"
                >
                    Accept Gig
                </button>

            `;
        }


        container.innerHTML = `

            <div class="form-container">

                <h2>
                    ${gig.title}
                </h2>


                <p>
                    ${gig.description}
                </p>


                <hr>


                <p>
                    <strong>
                        Category:
                    </strong>

                    ${gig.category}
                </p>


                <p>
                    <strong>
                        Location:
                    </strong>

                    ${gig.location}
                </p>


                <p>
                    <strong>
                        Reward:
                    </strong>

                    ₹${gig.reward}
                </p>


                <p>
                    <strong>
                        Deadline:
                    </strong>

                    ${gig.deadline ||
                        "Not specified"}
                </p>


                <p>
                    <strong>
                        Status:
                    </strong>

                    ${gig.status}
                </p>


                ${accepterDetails}


                ${ratingDetails}


                <div class="mt-3">

                    ${acceptButton}


                    <button
                        class="btn btn-secondary ms-2"
                        onclick="showPage('home')"
                    >
                        Back
                    </button>

                </div>

            </div>

        `;


        showPage("gigDetails");


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load gig details."
        );
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


    if (
        currentUser.role !== "accepter"
    ) {

        alert(
            "Only accepters can accept gigs."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/gigs/${id}/accept`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_id:
                            Number(
                                currentUser.id
                            )

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }


        alert(
            "Gig accepted successfully! 🎉"
        );


        loadGigs();

        loadMyGigs();

        showPage("myGigs");


    } catch (error) {

        console.error(error);

        alert(
            "Unable to accept gig."
        );
    }

}


// ==================================================
// POST GIG
// ==================================================

document
    .getElementById("gigForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (!currentUser) {

                showLogin();

                return;
            }


            if (
                currentUser.role !== "provider"
            ) {

                alert(
                    "Only providers can post gigs."
                );

                return;
            }


            const gigData = {

                title:
                    document
                        .getElementById("title")
                        .value
                        .trim(),

                description:
                    document
                        .getElementById(
                            "description"
                        )
                        .value
                        .trim(),

                category:
                    document
                        .getElementById(
                            "category"
                        )
                        .value,

                location:
                    document
                        .getElementById(
                            "location"
                        )
                        .value
                        .trim(),

                reward:
                    Number(
                        document
                            .getElementById(
                                "reward"
                            )
                            .value
                    ),

                deadline:
                    document
                        .getElementById(
                            "deadline"
                        )
                        .value,

                posted_by:
                    Number(
                        currentUser.id
                    )

            };


            try {

                const response =
                    await fetch(
                        `${API_URL}/gigs`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    gigData
                                )

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(data.message);

                    return;
                }


                alert(
                    "Gig posted successfully! 🎉"
                );


                document
                    .getElementById(
                        "gigForm"
                    )
                    .reset();


                showPage("home");


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to post gig."
                );
            }

        }
    );


// ==================================================
// MY GIGS
// ==================================================

async function loadMyGigs() {

    try {

        const response =
            await fetch(
                `${API_URL}/gigs`
            );


        const gigs =
            await response.json();


        const container =
            document.getElementById(
                "myGigsContainer"
            );


        container.innerHTML = "";


        const myGigs =
            gigs.filter(gig =>

                Number(gig.posted_by) ===
                    Number(currentUser.id)

                ||

                Number(gig.accepted_by) ===
                    Number(currentUser.id)

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


            // Accepter can complete accepted gig
            if (
                currentUser.role === "accepter" &&
                gig.status === "ACCEPTED" &&
                Number(gig.accepted_by) ===
                    Number(currentUser.id)
            ) {

                actionButton = `

                    <button
                        class="btn btn-success btn-sm"
                        onclick="completeGig(${gig.id})"
                    >
                        Mark Completed
                    </button>

                `;
            }


            // Accepter can rate completed gig
            if (
                currentUser.role === "accepter" &&
                gig.status === "COMPLETED" &&
                Number(gig.accepted_by) ===
                    Number(currentUser.id) &&
                !gig.rating
            ) {

                actionButton = `

                    <button
                        class="btn btn-primary btn-sm"
                        onclick="openRating(${gig.id})"
                    >
                        ⭐ Rate & Review
                    </button>

                `;
            }


            // Accepter details for provider
            let accepterDetails = "";


            if (
                currentUser.role === "provider" &&
                gig.accepted_by
            ) {

                accepterDetails = `

                    <div class="alert alert-info mt-3">

                        <h6>
                            👤 Accepter Details
                        </h6>


                        <p class="mb-1">

                            <strong>
                                Name:
                            </strong>

                            ${gig.accepter_name}

                        </p>


                        <p class="mb-1">

                            <strong>
                                Email:
                            </strong>

                            ${gig.accepter_email}

                        </p>


                        <p class="mb-0">

                            <strong>
                                Phone:
                            </strong>

                            ${gig.accepter_phone}

                        </p>

                    </div>

                `;
            }


            // Rating shown to provider
            let ratingDetails = "";


            if (
                currentUser.role === "provider" &&
                gig.rating
            ) {

                const stars =
                    "⭐".repeat(
                        Number(
                            gig.rating.rating
                        )
                    );


                ratingDetails = `

                    <div class="alert alert-warning mt-3">

                        <h6>
                            ⭐ Rating & Review
                        </h6>


                        <p class="mb-1">

                            <strong>
                                ${stars}
                            </strong>

                            (${gig.rating.rating}/5)

                        </p>


                        <p class="mb-1">

                            <strong>
                                Reviewed by:
                            </strong>

                            ${gig.rating.from_user_name}

                        </p>


                        <p class="mb-0">

                            <strong>
                                Review:
                            </strong>

                            ${gig.rating.comment ||
                                "No review provided."}

                        </p>

                    </div>

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


                            <p>
                                <strong>
                                    Category:
                                </strong>

                                ${gig.category}
                            </p>


                            <p>
                                📍 ${gig.location}
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


                            ${accepterDetails}


                            ${ratingDetails}


                            <div class="mt-3">

                                <button
                                    class="btn btn-outline-primary btn-sm"
                                    onclick="viewGig(${gig.id})"
                                >
                                    View Details
                                </button>

                                ${actionButton}

                            </div>

                        </div>

                    </div>

                </div>

            `;

        });


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load your gigs."
        );
    }

}


// ==================================================
// COMPLETE GIG
// ==================================================

async function completeGig(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/gigs/${id}/complete`,
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }


        alert(
            "Gig marked as completed! 🎉"
        );


        selectedGigForRating =
            data.gig;


        selectedRating = 0;


        document
            .getElementById(
                "ratingComment"
            )
            .value = "";


        resetStars();


        showPage("rating");


    } catch (error) {

        console.error(error);

        alert(
            "Unable to complete gig."
        );
    }

}


// ==================================================
// OPEN RATING
// ==================================================

async function openRating(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/gigs/${id}`
            );


        const gig =
            await response.json();


        selectedGigForRating =
            gig;


        selectedRating = 0;


        document
            .getElementById(
                "ratingComment"
            )
            .value = "";


        resetStars();


        showPage("rating");


    } catch (error) {

        console.error(error);

        alert(
            "Unable to open rating."
        );
    }

}


// ==================================================
// SELECT RATING
// ==================================================

function selectRating(value) {

    selectedRating = value;


    const stars =
        document.querySelectorAll(
            ".stars span"
        );


    stars.forEach(
        (star, index) => {

            if (index < value) {

                star.textContent =
                    "★";

            } else {

                star.textContent =
                    "☆";

            }

        }
    );

}


// ==================================================
// RESET STARS
// ==================================================

function resetStars() {

    const stars =
        document.querySelectorAll(
            ".stars span"
        );


    stars.forEach(star => {

        star.textContent =
            "☆";

    });

}


// ==================================================
// SUBMIT RATING
// ==================================================

async function submitRating() {

    if (!selectedGigForRating) {

        alert(
            "No gig selected for rating."
        );

        return;
    }


    if (selectedRating === 0) {

        alert(
            "Please select a rating."
        );

        return;
    }


    const comment =
        document
            .getElementById(
                "ratingComment"
            )
            .value
            .trim();


    try {

        /*
         * The person submitting the rating
         * rates the other person.
         */

        let toUser;


        if (
            Number(
                selectedGigForRating.posted_by
            ) ===
            Number(currentUser.id)
        ) {

            toUser =
                selectedGigForRating.accepted_by;

        } else {

            toUser =
                selectedGigForRating.posted_by;

        }


        const response =
            await fetch(
                `${API_URL}/gigs/${selectedGigForRating.id}/rating`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        from_user:
                            Number(
                                currentUser.id
                            ),

                        to_user:
                            Number(toUser),

                        rating:
                            Number(
                                selectedRating
                            ),

                        comment:
                            comment

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }


        alert(
            "Rating submitted successfully! ⭐"
        );


        selectedGigForRating =
            null;


        selectedRating = 0;


        showPage("home");


    } catch (error) {

        console.error(error);

        alert(
            "Unable to submit rating."
        );
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