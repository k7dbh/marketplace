// step 3
const express = require('express')
const router = express.Router()
const Listing = require('../models/listing')// step 8
const isSignedIn = require('../middleware/is-signed-in')
const upload = require('../config/multer')// step 9

// view New LISTING FORM
router.get("/new", (req, res) => {
    res.render('listings/new.ejs')
})

// POST FORM DATA TO THE DATABASE
// note to come back to isSignedIn
router.post('/', isSignedIn, upload.single('image'), async (req, res) => {
    try {
        req.body.seller = req.session.user._id
        req.body.image = {
            url: req.file.path,
            cloudinary_id: req.file.filename 
        }
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

// VIEW A SINGLE LISTING (SHOW PAGE) step 16
router.get('/:listingId', async (req, res) => {
    try {
        const foundListing = await Listing.findById(req.params.listingId).populate('seller').populate('comments.author')
        console.log(foundListing)
        res.render('listings/show.ejs', { foundListing: foundListing })
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})


// DELETE LISTING FROM DATABASE
router.delete('/:listingId', isSignedIn, async (req, res) => {
    // find the listing
    const foundListing = await Listing.findById(req.params.listingId).populate('seller')
    // check if the logged in user owns the listing
    if (foundListing.seller._id.equals(req.session.user._id)) {
        // delete the listing and redirect
        await foundListing.deleteOne()
        return res.redirect('/listings')
    }
    return res.send('Not authorized')
})

// RENDER THE EDIT FROM VIEW
router.get('/:listingId/edit', async (req, res) => {
    const foundListing = await Listing.findById(req.params.listingId).populate('seller')

    if (foundListing.seller._id.equals(req.session.user._id)) {
        return res.render('listings/edit.ejs', { foundListing: foundListing} )
    } 
        return res.send('Not authorized')
   

})

router.put('/:listingId', isSignedIn, async (req, res) => {
    const foundListing = await Listing.findById(req.params.listingId).populate('seller')
    if (foundListing.seller._id.equals(req.session.user._id)) {
        await Listing.findByIdAndUpdate(req.params.listingId, req.body, { new: true })
        return res.redirect(`/listings/${req.params.listingId}`)
    } 
        return res.send('Not authorized')
   
})

// POST COMMENTS TO THE DATABASE
router.post('/:listingId/comments', isSignedIn, async (req, res) => {
    const foundListing = await Listing.findById(req.params.listingId)
    req.body.author = req.session.user._id
    console.log(foundListing)
    foundListing.comments.push(req.body)
    await foundListing.save()
    res.redirect(`/listings/${req.params.listingId}`)
})

module.exports = router