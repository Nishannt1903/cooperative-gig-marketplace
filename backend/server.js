const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());


// ==================================================
// USERS
// ==================================================

let users = [
    {
        id: 1,
        name: "Rahul",
        email: "rahul@example.com",
        phone: "9876543210",
        role: "provider"
    },
    {
        id: 2,
        name: "Amit",
        email: "amit@example.com",
        phone: "9876543211",
        role: "accepter"
    }
];


// ==================================================
// GIGS
// ==================================================

let gigs = [];


// ==================================================
// RATINGS
// ==================================================

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
// GET USERS
// ==================================================

app.get("/api/users", (req, res) => {
    res.json(users);
});


// ==================================================
// GET USER BY ID
// ==================================================

app.get("/api/users/:id", (req, res) => {

    const user = users.find(
        u => u.id === Number(req.params.id)
    );

    if (!user) {
        return res.status(404).json({
            message: "User not found."
        });
    }

    res.json(user);
});


// ==================================================
// REGISTER
// ==================================================

app.post("/api/register", (req, res) => {

    const {
        name,
        email,
        phone,
        role
    } = req.body;

    if (!name || !email || !phone || !role) {
        return res.status(400).json({
            message: "Name, email, phone and role are required."
        });
    }

    if (!["provider", "accepter"].includes(role)) {
        return res.status(400).json({
            message: "Role must be provider or accepter."
        });
    }

    const existingEmail = users.find(
        u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingEmail) {
        return res.status(400).json({
            message: "Email already registered."
        });
    }

    const existingPhone = users.find(
        u => u.phone === phone
    );

    if (existingPhone) {
        return res.status(400).json({
            message: "Phone number already registered."
        });
    }

    const newUser = {
        id: users.length + 1,
        name,
        email,
        phone,
        role
    };

    users.push(newUser);

    res.status(201).json({
        message: "Registration successful!",
        user: newUser
    });
});


// ==================================================
// LOGIN
// ==================================================

app.post("/api/login", (req, res) => {

    const {
        email,
        phone,
        role
    } = req.body;

    if (!email || !phone || !role) {
        return res.status(400).json({
            message: "Email, phone number and role are required."
        });
    }

    const user = users.find(
        u =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.phone === phone &&
            u.role === role
    );

    if (!user) {
        return res.status(401).json({
            message: "Invalid email, phone number or role."
        });
    }

    res.json({
        message: "Login successful!",
        user
    });
});


// ==================================================
// GET ALL GIGS
// ==================================================

app.get("/api/gigs", (req, res) => {

    const result = gigs.map(gig => {

        const gigRating = ratings.find(
            r => r.gig_id === gig.id
        );

        return {
            ...gig,
            rating: gigRating || null
        };
    });

    res.json(result);
});


// ==================================================
// GET SINGLE GIG
// ==================================================

app.get("/api/gigs/:id", (req, res) => {

    const gig = gigs.find(
        g => g.id === Number(req.params.id)
    );

    if (!gig) {
        return res.status(404).json({
            message: "Gig not found."
        });
    }

    const gigRating = ratings.find(
        r => r.gig_id === gig.id
    );

    res.json({
        ...gig,
        rating: gigRating || null
    });
});


// ==================================================
// POST GIG
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

    if (
        !title ||
        !description ||
        !category ||
        !location ||
        reward === undefined ||
        !posted_by
    ) {
        return res.status(400).json({
            message: "All gig fields are required."
        });
    }

    const provider = users.find(
        u => u.id === Number(posted_by)
    );

    if (!provider) {
        return res.status(404).json({
            message: "Provider not found."
        });
    }

    if (provider.role !== "provider") {
        return res.status(403).json({
            message: "Only providers can post gigs."
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

        posted_by: provider.id,

        provider_name: provider.name,
        provider_email: provider.email,
        provider_phone: provider.phone,

        accepted_by: null,

        accepter_name: null,
        accepter_email: null,
        accepter_phone: null,

        status: "AVAILABLE",

        created_at: new Date()
    };

    gigs.push(newGig);

    res.status(201).json({
        message: "Gig posted successfully!",
        gig: newGig
    });
});


// ==================================================
// ACCEPT GIG
// ==================================================

app.post("/api/gigs/:id/accept", (req, res) => {

    const gig = gigs.find(
        g => g.id === Number(req.params.id)
    );

    if (!gig) {
        return res.status(404).json({
            message: "Gig not found."
        });
    }

    const accepter = users.find(
        u => u.id === Number(req.body.user_id)
    );

    if (!accepter) {
        return res.status(404).json({
            message: "Accepter not found."
        });
    }

    if (accepter.role !== "accepter") {
        return res.status(403).json({
            message: "Only accepters can accept gigs."
        });
    }

    if (gig.status !== "AVAILABLE") {
        return res.status(400).json({
            message: "This gig is no longer available."
        });
    }

    // Save accepter information
    gig.accepted_by = accepter.id;

    gig.accepter_name = accepter.name;
    gig.accepter_email = accepter.email;
    gig.accepter_phone = accepter.phone;

    gig.status = "ACCEPTED";

    res.json({
        message: "Gig accepted successfully! 🎉",
        gig
    });
});


// ==================================================
// COMPLETE GIG
// ==================================================

app.post("/api/gigs/:id/complete", (req, res) => {

    const gig = gigs.find(
        g => g.id === Number(req.params.id)
    );

    if (!gig) {
        return res.status(404).json({
            message: "Gig not found."
        });
    }

    if (gig.status !== "ACCEPTED") {
        return res.status(400).json({
            message: "Only accepted gigs can be completed."
        });
    }

    gig.status = "COMPLETED";

    res.json({
        message: "Gig marked as completed! 🎉",
        gig
    });
});


// ==================================================
// ADD RATING
// ==================================================

app.post("/api/gigs/:id/rating", (req, res) => {

    const gig = gigs.find(
        g => g.id === Number(req.params.id)
    );

    if (!gig) {
        return res.status(404).json({
            message: "Gig not found."
        });
    }

    if (gig.status !== "COMPLETED") {
        return res.status(400).json({
            message: "Gig must be completed before rating."
        });
    }

    const {
        from_user,
        to_user,
        rating,
        comment
    } = req.body;

    if (!from_user || !to_user || !rating) {
        return res.status(400).json({
            message: "Rating information is incomplete."
        });
    }

    const ratingNumber = Number(rating);

    if (
        ratingNumber < 1 ||
        ratingNumber > 5
    ) {
        return res.status(400).json({
            message: "Rating must be between 1 and 5."
        });
    }

    // Prevent duplicate rating
    const alreadyRated = ratings.find(
        r =>
            r.gig_id === gig.id &&
            r.from_user === Number(from_user)
    );

    if (alreadyRated) {
        return res.status(400).json({
            message: "You have already rated this gig."
        });
    }

    const reviewer = users.find(
        u => u.id === Number(from_user)
    );

    const receiver = users.find(
        u => u.id === Number(to_user)
    );

    const newRating = {

        id: ratings.length + 1,

        gig_id: gig.id,

        from_user: Number(from_user),
        from_user_name: reviewer
            ? reviewer.name
            : "Unknown",

        to_user: Number(to_user),
        to_user_name: receiver
            ? receiver.name
            : "Unknown",

        rating: ratingNumber,

        comment: comment || "",

        created_at: new Date()
    };

    ratings.push(newRating);

    res.status(201).json({
        message: "Rating submitted successfully! ⭐",
        rating: newRating
    });
});


// ==================================================
// GET ALL RATINGS
// ==================================================

app.get("/api/ratings", (req, res) => {
    res.json(ratings);
});


// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(`
========================================
 Cooperative Gig Marketplace
========================================

Server running on:
http://localhost:${PORT}

Network:
http://192.168.6.127:${PORT}

========================================
`);
});