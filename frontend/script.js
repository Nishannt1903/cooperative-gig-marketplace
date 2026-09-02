// =====================================================
// API
// =====================================================

const API_URL =
    "http://192.168.6.127:5000/api";


// =====================================================
// CURRENT USER
// =====================================================

let currentUser =
    JSON.parse(
        localStorage.getItem("currentUser")
    ) || null;


let selectedRating = 0;

let selectedGigForRating = null;


// =====================================================
// SHOW PAGE
// =====================================================

function showPage(pageId) {

    if (!currentUser) {

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

        loadGigs();

    }


    if (pageId === "myGigs") {

        loadMyGigs();

    }

}


// =====================================================
// SHOW LOGIN
// =====================================================

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


// =====================================================
// SHOW REGISTER
// =====================================================

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


// =====================================================
// UPDATE NAVBAR
// =====================================================

function updateUserDisplay() {

    const nameDisplay =
        document.getElementById(
            "userNameDisplay"
        );


    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    const postButton =
        document.getElementById(
            "postGigNavButton"
        );


    const homePostButton =
        document.getElementById(
            "homePostButton"
        );


    if (!currentUser) {

        nameDisplay.textContent = "";

        logoutButton.style.display =
            "none";

        postButton.style.display =
            "none";

        homePostButton.style.display =
            "none";

        return;
    }


    nameDisplay.textContent =
        `${currentUser.name} (${currentUser.role})`;


    logoutButton.style.display =
        "block";


    if (
        currentUser.role === "provider"
    ) {

        postButton.style.display =
            "block";

        homePostButton.style.display =
            "inline-block";

    } else {

        postButton.style.display =
            "none";

        homePostButton.style.display =
            "none";

    }

}


// =====================================================
// LOGIN
// =====================================================

document
    .getElementById("loginForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            const role =
                document
                    .getElementById("loginRole")
                    .value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            try {

                const response =
                    await fetch(
                        `${API_URL}/login`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                role: role
                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.innerHTML = `
                        <div class="alert alert-danger">
                            ${data.message}
                        </div>
                    `;

                    return;
                }


                currentUser =
                    data.user;


                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(
                        currentUser
                    )
                );


                message.innerHTML = `
                    <div class="alert alert-success">
                        Login successful! 🎉
                    </div>
                `;


                updateUserDisplay();


                setTimeout(
                    function() {

                        showPage("home");

                    },
                    500
                );


            } catch (error) {

                console.error(error);


                message.innerHTML = `
                    <div class="alert alert-danger">
                        Cannot connect to backend.
                        Make sure the server is running.
                    </div>
                `;

            }

        }
    );


// =====================================================
// REGISTER
// =====================================================

document
    .getElementById("registerForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "registerName"
                    )
                    .value
                    .trim();


            const email =
                document
                    .getElementById(
                        "registerEmail"
                    )
                    .value
                    .trim();


            const role =
                document
                    .getElementById(
                        "registerRole"
                    )
                    .value;


            const message =
                document.getElementById(
                    "registerMessage"
                );


            try {

                const response =
                    await fetch(
                        `${API_URL}/register`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,

                                email: email,

                                role: role

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.innerHTML = `
                        <div class="alert alert-danger">
                            ${data.message}
                        </div>
                    `;

                    return;
                }


                message.innerHTML = `
                    <div class="alert alert-success">
                        Registration successful! 🎉
                        <br>
                        You can now login.
                    </div>
                `;


                document
                    .getElementById(
                        "registerForm"
                    )
                    .reset();


                setTimeout(
                    function() {

                        showLogin();

                        document
                            .getElementById(
                                "loginEmail"
                            )
                            .value = email;


                        document
                            .getElementById(
                                "loginRole"
                            )
                            .value = role;

                    },
                    1000
                );


            } catch (error) {

                console.error(error);


                message.innerHTML = `
                    <div class="alert alert-danger">
                        Cannot connect to backend.
                    </div>
                `;

            }

        }
    );


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    localStorage.removeItem(
        "currentUser"
    );


    currentUser = null;


    selectedRating = 0;

    selectedGigForRating = null;


    updateUserDisplay();


    showLogin();

}


// =====================================================
// LOAD GIGS
// =====================================================

async function loadGigs() {

    const container =
        document.getElementById(
            "gigContainer"
        );


    try {

        const response =
            await fetch(
                `${API_URL}/gigs`
            );


        const gigs =
            await response.json();


        container.innerHTML = "";


        if (gigs.length === 0) {

            container.innerHTML = `

                <div class="col-12">

                    <div class="alert alert-info">

                        No gigs available yet.

                    </div>

                </div>

            `;

            return;
        }


        gigs.forEach(
            function(gig) {

                container.innerHTML +=
                    createGigCard(gig);

            }
        );


    } catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="col-12">

                <div class="alert alert-danger">

                    Cannot connect to backend.

                </div>

            </div>

        `;

    }

}


// =====================================================
// CREATE GIG CARD
// =====================================================

function createGigCard(gig) {

    let actionButton = "";


    if (
        currentUser &&
        currentUser.role === "accepter" &&
        gig.status === "AVAILABLE"
    ) {

        actionButton = `

            <button
                class="btn btn-success"
                onclick="acceptGig(${gig.id})"
            >
                Accept Gig
            </button>

        `;

    } else {

        actionButton = `

            <button
                class="btn btn-outline-primary"
                onclick="viewGig(${gig.id})"
            >
                View Details
            </button>

        `;

    }


    return `

        <div class="col-md-6 col-lg-4">

            <div class="card gig-card h-100">

                <div class="card-body">


                    <h5 class="card-title">

                        ${gig.title}

                    </h5>


                    <p class="card-text">

                        ${gig.description}

                    </p>


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
                            Provider:
                        </strong>

                        ${gig.provider_name}

                    </p>


                    <p>

                        <strong>
                            Status:
                        </strong>

                        ${gig.status}

                    </p>


                    ${actionButton}


                </div>

            </div>

        </div>

    `;

}


// =====================================================
// VIEW GIG
// =====================================================

async function viewGig(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/gigs/${id}`
            );


        const gig =
            await response.json();


        document
            .querySelectorAll(".page")
            .forEach(page => {

                page.classList.add("d-none");

            });


        document
            .getElementById(
                "gigDetails"
            )
            .classList.remove("d-none");


        document
            .getElementById(
                "detailsContainer"
            )
            .innerHTML = `

                <div class="card">

                    <div class="card-body">

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

                            ${gig.deadline || "Not specified"}
                        </p>


                        <p>
                            <strong>
                                Provider:
                            </strong>

                            ${gig.provider_name}
                        </p>


                        <p>
                            <strong>
                                Status:
                            </strong>

                            ${gig.status}
                        </p>


                        <button
                            class="btn btn-secondary"
                            onclick="showPage('home')"
                        >
                            Back
                        </button>


                    </div>

                </div>

            `;


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load gig details."
        );

    }

}


// =====================================================
// ACCEPT GIG
// =====================================================

async function acceptGig(id) {

    if (!currentUser) {

        alert(
            "Please login first."
        );

        return;
    }


    if (
        currentUser.role !== "accepter"
    ) {

        alert(
            "Only a Gig Accepter can accept gigs."
        );

        return;
    }


    console.log(
        "Accepting Gig:",
        id
    );


    console.log(
        "Current User:",
        currentUser
    );


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


        console.log(
            "Accept Response:",
            data
        );


        if (!response.ok) {

            alert(
                data.message
            );

            return;
        }


        alert(
            "Gig accepted successfully! 🎉"
        );


        await loadGigs();

        await loadMyGigs();


        showPage(
            "myGigs"
        );


    } catch (error) {

        console.error(
            "Accept Error:",
            error
        );


        alert(
            "Cannot connect to backend."
        );

    }

}


// =====================================================
// POST GIG
// =====================================================

document
    .getElementById("gigForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (!currentUser) {

                alert(
                    "Please login first."
                );

                return;
            }


            if (
                currentUser.role !==
                "provider"
            ) {

                alert(
                    "Only a Gig Provider can post gigs."
                );

                return;
            }


            const gigData = {

                title:
                    document
                        .getElementById(
                            "title"
                        )
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

                    alert(
                        data.message
                    );

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


                await loadGigs();


                showPage(
                    "home"
                );


            } catch (error) {

                console.error(error);


                alert(
                    "Cannot connect to backend."
                );

            }

        }
    );


// =====================================================
// LOAD MY GIGS
// =====================================================

async function loadMyGigs() {

    const container =
        document.getElementById(
            "myGigsContainer"
        );


    try {

        const response =
            await fetch(
                `${API_URL}/gigs`
            );


        const gigs =
            await response.json();


        const myGigs =
            gigs.filter(

                gig =>

                    Number(
                        gig.posted_by
                    ) ===
                    Number(
                        currentUser.id
                    )

                    ||

                    Number(
                        gig.accepted_by
                    ) ===
                    Number(
                        currentUser.id
                    )

            );


        container.innerHTML = "";


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


        myGigs.forEach(
            function(gig) {

                let action = "";


                // Accepter can complete

                if (

                    currentUser.role ===
                    "accepter"

                    &&

                    Number(
                        gig.accepted_by
                    ) ===
                    Number(
                        currentUser.id
                    )

                    &&

                    gig.status ===
                    "ACCEPTED"

                ) {

                    action = `

                        <button
                            class="btn btn-success"
                            onclick="completeGig(${gig.id})"
                        >
                            Mark Completed
                        </button>

                    `;

                }


                container.innerHTML += `

                    <div class="col-md-6">

                        <div class="card gig-card">

                            <div class="card-body">


                                <h5>
                                    ${gig.title}
                                </h5>


                                <p>
                                    ${gig.description}
                                </p>


                                <p>

                                    <strong>
                                        Reward:
                                    </strong>

                                    ₹${gig.reward}

                                </p>


                                <p>

                                    <strong>
                                        Status:
                                    </strong>

                                    ${gig.status}

                                </p>


                                <p>

                                    <strong>
                                        Provider:
                                    </strong>

                                    ${gig.provider_name}

                                </p>


                                ${
                                    gig.accepter_name

                                    ?

                                    `
                                    <p>

                                        <strong>
                                            Accepter:
                                        </strong>

                                        ${gig.accepter_name}

                                    </p>
                                    `

                                    :

                                    ""
                                }


                                ${action}


                            </div>

                        </div>

                    </div>

                `;

            }
        );


    } catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="col-12">

                <div class="alert alert-danger">

                    Cannot load your gigs.

                </div>

            </div>

        `;

    }

}


// =====================================================
// COMPLETE GIG
// =====================================================

async function completeGig(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/gigs/${id}/complete`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message
            );

            return;
        }


        alert(
            "Gig completed successfully! 🎉"
        );


        selectedGigForRating =
            data.gig;


        openRating(
            data.gig.id
        );


    } catch (error) {

        console.error(error);


        alert(
            "Cannot connect to backend."
        );

    }

}


// =====================================================
// OPEN RATING
// =====================================================

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


        resetStars();


        document
            .getElementById(
                "ratingComment"
            )
            .value = "";


        document
            .querySelectorAll(".page")
            .forEach(page => {

                page.classList.add("d-none");

            });


        document
            .getElementById(
                "rating"
            )
            .classList.remove("d-none");


    } catch (error) {

        console.error(error);


        alert(
            "Unable to open rating."
        );

    }

}


// =====================================================
// SELECT RATING
// =====================================================

function selectRating(number) {

    selectedRating =
        number;


    const stars =
        document.querySelectorAll(
            ".stars span"
        );


    stars.forEach(
        function(star, index) {

            if (
                index < number
            ) {

                star.textContent =
                    "★";

            } else {

                star.textContent =
                    "☆";

            }

        }
    );

}


// =====================================================
// RESET STARS
// =====================================================

function resetStars() {

    document
        .querySelectorAll(
            ".stars span"
        )
        .forEach(
            function(star) {

                star.textContent =
                    "☆";

            }
        );

}


// =====================================================
// SUBMIT RATING
// =====================================================

async function submitRating() {

    if (!currentUser) {

        alert(
            "Please login first."
        );

        return;
    }


    if (!selectedGigForRating) {

        alert(
            "No gig selected."
        );

        return;
    }


    if (selectedRating === 0) {

        alert(
            "Please select a rating."
        );

        return;
    }


    const gig =
        selectedGigForRating;


    let toUser;


    // If provider is rating,
    // rate the accepter.

    if (

        Number(
            gig.posted_by
        ) ===
        Number(
            currentUser.id
        )

    ) {

        toUser =
            Number(
                gig.accepted_by
            );

    }

    // If accepter is rating,
    // rate the provider.

    else {

        toUser =
            Number(
                gig.posted_by
            );

    }


    const comment =
        document
            .getElementById(
                "ratingComment"
            )
            .value
            .trim();


    try {

        const response =
            await fetch(
                `${API_URL}/gigs/${gig.id}/rating`,
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
                            toUser,

                        rating:
                            selectedRating,

                        comment:
                            comment

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message
            );

            return;
        }


        alert(
            "Rating submitted successfully! ⭐"
        );


        selectedRating = 0;

        selectedGigForRating = null;


        resetStars();


        showPage(
            "myGigs"
        );


    } catch (error) {

        console.error(error);


        alert(
            "Cannot connect to backend."
        );

    }

}


// =====================================================
// START APPLICATION
// =====================================================

updateUserDisplay();


if (currentUser) {

    showPage(
        "home"
    );

} else {

    showLogin();

}