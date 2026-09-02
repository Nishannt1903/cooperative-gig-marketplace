const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

// ==================================================
// TEMPORARY DATABASE
// ==================================================

let users = [
    {
        id: 1,
        name: "Rahul",
        email: "rahul@example.com"
    },
    {
        id: 2,
        name: "Amit",
        email: "amit@example.com"
    }
];

let gigs = [];
let ratings = [];

// ==================================================
// HOME
// ==================================================

app.get("/", (req, res) => {
    res.json({
        message: "Cooperative Gig Marketplace API is running!"
    });
});

// ==================================================
// USERS
// ==================================================

// Get all users
app.get("/api/users", (req, res) => {
    res.json(users);
});

// Get one user
app.get("/api/users/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.json(user);
});

// ==================================================
// GIGS
// ==================================================

// GET ALL GIGS
app.get("/api/gigs", (req, res) => {
    res.json(gigs);
});

// GET ONE GIG
app.get("/api/gigs/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const gig = gigs.find(gig => gig.id === id);

    if (!gig) {
        return res.status(404).json({
            message: "Gig not found"
        });
    }

    res.json(gig);
});

// ==================================================
// CREATE GIG
// ==================================================

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

    if (!title || !description || !category || !location || !reward) {
        return res.status(400).json({
            message: "Please provide title, description, category, location and reward"
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
        posted_by: posted_by || 1,
        accepted_by: null,
        status: "AVAILABLE",
        created_at: new Date()
    };

    gigs.push(newGig);

    res.status(201).json({
        message: "Gig posted successfully",
        gig: newGig
    });
});

// ==================================================
// ACCEPT GIG
// ==================================================

app.post("/api/gigs/:id/accept", (req, res) => {
    const id = parseInt(req.params.id);
    const { user_id } = req.body;

    const gig = gigs.find(gig => gig.id === id);

    if (!gig) {
        return res.status(404).json({
            message: "Gig not found"
        });
    }

    if (!user_id) {
        return res.status(400).json({
            message: "User ID is required"
        });
    }

    const user = users.find(user => user.id === Number(user_id));

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    if (gig.status !== "AVAILABLE") {
        return res.status(400).json({
            message: "This gig is not available"
        });
    }

    if (gig.posted_by === Number(user_id)) {
        return res.status(400).json({
            message: "You cannot accept your own gig"
        });
    }

    gig.accepted_by = Number(user_id);
    gig.status = "ACCEPTED";

    res.json({
        message: "Gig accepted successfully",
        gig: gig
    });
});

// ==================================================
// COMPLETE GIG
// ==================================================

app.post("/api/gigs/:id/complete", (req, res) => {
    const id = parseInt(req.params.id);

    const gig = gigs.find(gig => gig.id === id);

    if (!gig) {
        return res.status(404).json({
            message: "Gig not found"
        });
    }

    if (gig.status !== "ACCEPTED") {
        return res.status(400).json({
            message: "Gig must be accepted before completion"
        });
    }

    gig.status = "COMPLETED";

    res.json({
        message: "Gig completed successfully",
        gig: gig
    });
});

// ==================================================
// RATE GIG
// ==================================================

app.post("/api/gigs/:id/rating", (req, res) => {
    const id = parseInt(req.params.id);

    const {
        from_user,
        to_user,
        rating,
        comment
    } = req.body;

    const gig = gigs.find(gig => gig.id === id);

    if (!gig) {
        return res.status(404).json({
            message: "Gig not found"
        });
    }

    if (gig.status !== "COMPLETED") {
        return res.status(400).json({
            message: "Only completed gigs can be rated"
        });
    }

    if (!from_user || !to_user || !rating) {
        return res.status(400).json({
            message: "from_user, to_user and rating are required"
        });
    }

    const numericRating = Number(rating);

    if (numericRating < 1 || numericRating > 5) {
        return res.status(400).json({
            message: "Rating must be between 1 and 5"
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
        message: "Rating submitted successfully",
        rating: newRating
    });
});

// ==================================================
// GET RATINGS
// ==================================================

app.get("/api/ratings", (req, res) => {
    res.json(ratings);
});

// ==================================================
// SERVER
// ==================================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); //