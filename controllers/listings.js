const Listing = require("../models/listing");
const maptilerClient =require("@maptiler/client");
maptilerClient.config.apiKey=process.env.MAPTILER_KEY;
 
module.exports.index = async (req, res) => {
    let { search,category} = req.query;
    let allListings;

     if (category) {
        allListings = await Listing.find({ category: category });
    }
     else if (search && search.trim() !=="") {
        // Use regex for a case-insensitive search across multiple fields
        const regex = new RegExp(search, "i"); 
        allListings = await Listing.find({
            $or: [
                { title: regex },
                { location: regex },
                { country: regex },
                { description: regex }
            ]
        });
    }else{
          allListings = await Listing.find({});
    }

    res.render("listings/index.ejs",{allListings});
};



module.exports.renderNewForm =  (req, res) => {
    res.render("listings/new.ejs");
};


module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({path: "reviews", populate: {path: "author",
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", " Listing you requested for does not  exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing,maptilerKey: process.env.MAPTILER_KEY });

};


module.exports.createListing = async (req, res, next) => {
  let url =  req.file.path;
  let filename = req.file.filename;

  const result = await maptilerClient.geocoding.forward(req.body.listing.location,{limit:1});

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image ={url,filename};
        newListing.geometry=result.features[0].geometry;
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");


    };



module.exports.renderEditForm =  async (req, res) => {

        let { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", " Listing you requested for does not  exist!");
            return res.redirect("/listings");
        }
        let orginalImageUrl = listing.image.url;
        orginalImageUrl = orginalImageUrl.replace("/upload","/upload/,w_250");
        res.render("listings/edit.ejs", { listing , orginalImageUrl});
    };   



module.exports.updateListing = async (req, res) => {

        let { id } = req.params;
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

        if( typeof req.file !== "undefined"){
        let url =  req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
        }
        req.flash("success", " Listing Updated!");
        res.redirect(`/listings/${id}`);
    };




module.exports.destroyListing = async (req, res) => {
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        req.flash("success", " Listing Deleted!");
        res.redirect("/listings");

    };



 