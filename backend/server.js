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

app.get("/api/users", (req, res) => {
    res.json(users);
});

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
// REGISTER
// ==================================================

app.post("/api/register", (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            message: "Name and email are required"
        });
    }

    const existingUser = users.find(
        user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
        return res.status(400).json({
            message: "Email already registered"
        });
    }

    const newUser = {
        id: users.length + 1,
        name,
        email
    };

    users.push(newUser);

    res.status(201).json({
        message: "Registration successful",
        user: newUser
    });
});

// ==================================================
// LOGIN
// ==================================================

app.post("/api/login", (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    const user = users.find(
        user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
        return res.status(404).json({
            message: "User not found. Please register first."
        });
    }

    res.json({
        message: "Login successful",
        user
    });
});

// ==================================================
// GIGS
// ==================================================

app.get("/api/gigs", (req, res) => {
    res.json(gigs);
});

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
        title,
        description,
        category,
        location,
        reward: Number(reward),
        deadline: deadline || null,
        posted_by: Number(posted_by) || 1,
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
        gig
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
        gig
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

    const numericRating = Number(rating);

    if (!from_user || !to_user || !numericRating) {
        return res.status(400).json({
            message: "Required rating information is missing"
        });
    }

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
});