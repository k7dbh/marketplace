// step 3
const express = require('express')
const router = express.Router()
const Listing = require('../models/listing')// step 8

// view New LISTING FORM
router.get("/new", (req, res) => {
    res.render('listings/new.ejs')
})

// POST FORM DATA TO THE DATABASE
// note to come back to isSignedIn
router.post('/', async (req, res) => {
    try {
        req.body.seller = req.session.user._id
        await Listing.create(req.body)
        res.redirect('/listings') // step 11
    } catch (error) {
        console.log(error)
        res.send('Something went wrong')
    }
})

// VIEW THE INDEX PAGE step 10
router.get('/', async (req, res) => {
    const foundListings = await Listing.find()
    console.log(foundListings)
    res.render('listings/index.ejs', { foundListings: foundListings })// step 12
})

// VIEW A SINGLE LISTING (SHOW PAGE)
router.get('/:listingId', async (req, res) => {
    const foundListing = await Listing.findById(req.params.listingId).populate('seller') // step 16
    console.log(foundListing)
    res.render('listings/show.ejs', {foundListing: foundListing})
})


module.exports = router