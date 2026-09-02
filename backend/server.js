const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;


// =====================================================
// USERS
// =====================================================

let users = [
    {
        id: 1,
        name: "Rahul",
        email: "rahul@example.com",
        role: "provider"
    },
    {
        id: 2,
        name: "Amit",
        email: "amit@example.com",
        role: "accepter"
    }
];


// =====================================================
// DATA
// =====================================================

let gigs = [];
let ratings = [];


// =====================================================
// HOME / SERVER TEST
// =====================================================

app.get("/", (req, res) => {

    res.json({
        message: "GigConnect API is running!"
    });

});


// =====================================================
// REGISTER
// =====================================================

app.post("/api/register", (req, res) => {

    const {
        name,
        email,
        role
    } = req.body;


    if (!name || !email || !role) {

        return res.status(400).json({
            message: "Name, email and role are required"
        });

    }


    if (
        role !== "provider" &&
        role !== "accepter"
    ) {

        return res.status(400).json({
            message: "Invalid role selected"
        });

    }


    const existingUser = users.find(
        user =>
            user.email.toLowerCase() ===
            email.toLowerCase()
    );


    if (existingUser) {

        return res.status(400).json({
            message: "Email already registered"
        });

    }


    const newUser = {

        id: users.length + 1,

        name: name,

        email: email,

        role: role

    };


    users.push(newUser);


    res.status(201).json({

        message: "Registration successful!",

        user: newUser

    });

});


// =====================================================
// LOGIN
// =====================================================

app.post("/api/login", (req, res) => {

    const {
        email,
        role
    } = req.body;


    if (!email || !role) {

        return res.status(400).json({
            message: "Email and role are required"
        });

    }


    const user = users.find(

        user =>
            user.email.toLowerCase() ===
            email.toLowerCase()
            &&
            user.role === role

    );


    if (!user) {

        return res.status(401).json({

            message:
                "Invalid email or role. Please check your details."

        });

    }


    res.json({

        message: "Login successful!",

        user: user

    });

});


// =====================================================
// GET USERS
// =====================================================

app.get("/api/users", (req, res) => {

    res.json(users);

});


// =====================================================
// GET ALL GIGS
// =====================================================

app.get("/api/gigs", (req, res) => {

    res.json(gigs);

});


// =====================================================
// GET SINGLE GIG
// =====================================================

app.get("/api/gigs/:id", (req, res) => {

    const id = Number(req.params.id);


    const gig = gigs.find(
        gig => gig.id === id
    );


    if (!gig) {

        return res.status(404).json({

            message: "Gig not found"

        });

    }


    res.json(gig);

});


// =====================================================
// POST GIG
// ONLY PROVIDER
// =====================================================

app.post("/api/gigs", (req, res) => {

    const {
        title,
        description,
        category,
        location,
        reward,
        deadline,
        posted_by
    } = req.body;


    if (
        !title ||
        !description ||
        !category ||
        !location ||
        !reward ||
        !posted_by
    ) {

        return res.status(400).json({

            message:
                "Please provide all gig details"

        });

    }


    const provider = users.find(

        user =>
            user.id === Number(posted_by)

    );


    if (!provider) {

        return res.status(404).json({

            message: "Provider not found"

        });

    }


    if (provider.role !== "provider") {

        return res.status(403).json({

            message:
                "Only Gig Providers can post gigs"

        });

    }


    const newGig = {

        id: gigs.length + 1,

        title: title,

        description: description,

        category: category,

        location: location,

        reward: Number(reward),

        deadline: deadline || null,

        posted_by: provider.id,

        provider_name: provider.name,

        accepted_by: null,

        accepter_name: null,

        status: "AVAILABLE",

        created_at: new Date()

    };


    gigs.push(newGig);


    res.status(201).json({

        message: "Gig posted successfully!",

        gig: newGig

    });

});


// =====================================================
// ACCEPT GIG
// ONLY ACCEPTER
// =====================================================

app.post("/api/gigs/:id/accept", (req, res) => {

    const id = Number(req.params.id);

    const {
        user_id
    } = req.body;


    const gig = gigs.find(
        gig => gig.id === id
    );


    if (!gig) {

        return res.status(404).json({

            message: "Gig not found"

        });

    }


    const accepter = users.find(

        user =>
            user.id === Number(user_id)

    );


    if (!accepter) {

        return res.status(404).json({

            message: "User not found"

        });

    }


    if (accepter.role !== "accepter") {

        return res.status(403).json({

            message:
                "Only Gig Accepters can accept gigs"

        });

    }


    if (gig.status !== "AVAILABLE") {

        return res.status(400).json({

            message:
                "This gig is no longer available"

        });

    }


    if (
        gig.posted_by === accepter.id
    ) {

        return res.status(400).json({

            message:
                "You cannot accept your own gig"

        });

    }


    gig.accepted_by = accepter.id;

    gig.accepter_name = accepter.name;

    gig.status = "ACCEPTED";


    res.json({

        message:
            "Gig accepted successfully! 🎉",

        gig: gig

    });

});


// =====================================================
// COMPLETE GIG
// =====================================================

app.post("/api/gigs/:id/complete", (req, res) => {

    const id = Number(req.params.id);


    const gig = gigs.find(
        gig => gig.id === id
    );


    if (!gig) {

        return res.status(404).json({

            message: "Gig not found"

        });

    }


    if (gig.status !== "ACCEPTED") {

        return res.status(400).json({

            message:
                "Gig must be accepted before completion"

        });

    }


    gig.status = "COMPLETED";


    res.json({

        message:
            "Gig completed successfully! 🎉",

        gig: gig

    });

});


// =====================================================
// RATING
// =====================================================

app.post("/api/gigs/:id/rating", (req, res) => {

    const id = Number(req.params.id);


    const {
        from_user,
        to_user,
        rating,
        comment
    } = req.body;


    const gig = gigs.find(
        gig => gig.id === id
    );


    if (!gig) {

        return res.status(404).json({

            message: "Gig not found"

        });

    }


    if (gig.status !== "COMPLETED") {

        return res.status(400).json({

            message:
                "Only completed gigs can be rated"

        });

    }


    const numericRating = Number(rating);


    if (
        !from_user ||
        !to_user ||
        !numericRating
    ) {

        return res.status(400).json({

            message:
                "Rating information is missing"

        });

    }


    if (
        numericRating < 1 ||
        numericRating > 5
    ) {

        return res.status(400).json({

            message:
                "Rating must be between 1 and 5"

        });

    }


    const newRating = {

        id: ratings.length + 1,

        gig_id: id,

        from_user: Number(from_user),

        to_user: Number(to_user),

        rating: numericRating,

        comment: comment || "",

        created_at: new Date()

    };


    ratings.push(newRating);


    res.status(201).json({

        message:
            "Rating submitted successfully! ⭐",

        rating: newRating

    });

});


// =====================================================
// GET RATINGS
// =====================================================

app.get("/api/ratings", (req, res) => {

    res.json(ratings);

});


// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    }
);