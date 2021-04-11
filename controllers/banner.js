var AnimatedBanner = require('../models/animatedBanner');
var AnimatedBannerItem = require('../models/animatedBannerItem');
var EditableArea = require('../models/editableArea');
const { errorHandler } = require('../helpers/dbErrorHandler');
const { dynamicSort } = require('../helpers/sorting');
const { body } = require('express-validator');
const animatedBannerItem = require('../models/animatedBannerItem');
const editableArea = require('../models/editableArea');
const animatedBanner = require('../models/animatedBanner');
const { uploadBannerImages, uploadBannerImageURLs } = require('../helpers/imageUploader')

exports.loadAnimatedBanner = async function (req, res, next) {
    var animatedBanner = await AnimatedBanner.findOne({ title: req.params.title });

    // if there is no editable area, create one
    if (!animatedBanner) {
        animatedBanner = AnimatedBanner.createBanner(req.params.title)
    }

    await animatedBanner.populate('items').execPopulate();
    await Promise.all(animatedBanner.items.map(async (bannerItem) => {
        await bannerItem.populate('EditableArea').execPopulate();
        return bannerItem
    }))

    // if there are no items, create one 
    if (animatedBanner.items.length <= 0) {

        var editableArea = await EditableArea.findOne({ guid: `${0}`, pathname: animatedBanner.title })
        if (!editableArea) {
            editableArea = new EditableArea({
                content: "<p>Coming Soon</p>",
                pathname: animatedBanner.title,
                guid: `${0}`
            });
            await editableArea.save();
        }

        var bannerItem = await AnimatedBannerItem.findOne({ guid: `${0}`, pathname: animatedBanner.title })
        if (!bannerItem) {
            var bannerItem = new AnimatedBannerItem({
                pathname: animatedBanner.title,
                guid: 0,
                image: 'https://via.placeholder.com/1500',
                EditableArea: editableArea,
                format: "image"
            });
            await bannerItem.save();
        }
        animatedBanner.items.push(bannerItem);
        await animatedBanner.save();
    }

    // //order animatedbanner.items by guid
    // animatedBanner.items.sort(dynamicSort("guid"));

    res.json(animatedBanner);
}

exports.create = async function (req, res) {

    try {
        var banner = await AnimatedBanner.findOne({ title: req.body.title });
        if (banner) {
            return res.status(400).json({
                errors: [{ message: 'Title is taken' }],
            })
        }

        var newBanner = AnimatedBanner.createBanner(req.body);
        await newBanner.save();
        return res.status(200).json({ newBanner });

    } catch (e) {

        return res.status(400).json({
            err: errorHandler(e)
        });

    }

}

exports.addSlides = async function (req, res, next) {

    var animatedBanner = await AnimatedBanner.findOne({ title: req.body.title });
    if (animatedBanner) {

        await animatedBanner.populate('items').execPopulate();
        await Promise.all(animatedBanner.items.map(async (bannerItem) => {
            await bannerItem.populate('EditableArea').execPopulate();
            return bannerItem
        }))

        // slide number
        // if length == 1, new slide guid = guid == 1
        // if length == 2, new slide guide = guid == 2
        var slideNumber = animatedBanner.items.length;

        // if there is no editable area, create one 

        var editableArea = await EditableArea.findOne({ guid: `${slideNumber}`, pathname: animatedBanner.title })
        if (!editableArea) {
            editableArea = new EditableArea({
                content: "<p>Coming Soon</p>",
                pathname: animatedBanner.title,
                guid: `${slideNumber}`
            });
            await editableArea.save();

        }

        // if there is no banner item, create one
        var bannerItem = await AnimatedBannerItem.findOne({ guid: `${slideNumber}`, pathname: animatedBanner.title })
        if (!bannerItem) {
            bannerItem = new AnimatedBannerItem({
                pathname: animatedBanner.title,
                guid: slideNumber,
                image: 'https://via.placeholder.com/1500',
                EditableArea: editableArea,
                format: "image"
            });
        }
        animatedBanner.items.push(bannerItem);
        await bannerItem.save();

    } else {
        res.json({
            errors: [{ message: 'No banner with that title was found' }]
        })
    }
    await animatedBanner.save();
    res.json({ animatedBanner, message: "Slide added", length: animatedBanner.items.length });
}

exports.deleteSlide = async function (req, res) {

    try {
        var banner = await AnimatedBanner.findOne({ title: req.body.animatedBanner.title });
        if (banner) {

            if (banner.items.length == 1) {

                res.json({ banner, message: "Cannot delete the only slide." })
                return
            }
            else {

                await banner.populate('items').execPopulate();

                banner.items = await Promise.all(banner.items.map(async (bannerItem) => {
                    await bannerItem.populate('EditableArea').execPopulate();
                    return bannerItem

                }))

                // delete the deleted current slide from the list
                banner.items = banner.items.filter(q => q.guid != (req.body.slideNumber))

                await AnimatedBannerItem.deleteOne({ pathname: banner.title, guid: req.body.slideNumber })
                await EditableArea.deleteOne({ pathname: banner.title, guid: req.body.slideNumber })

                var items = await array_values(banner.items)

                await Promise.all(items.map(async (item, index) => {
                    
                    await item.save();
                }))

                banner.items = items;

                await banner.save();

                res.json({ message: "Slide deleted", banner });

                async function array_values(arrayObj) {

                    // editable area goes missing here?
                    // number of slides, ID of slides
                    // Write down the ids of the slides + number of slides
                    // Write down the IDs after the slides are shuffled
                    // editable area is not created?
                    // check the ID's of the editable areas

                    // shuffle slides

                    arrayObj.sort(dynamicSort("guid"))


                    await Promise.all(arrayObj.map(async (item, index) => {
                        var area = await EditableArea.findOne({ guid: item.guid, pathname: item.pathname })

                        if (!area) {
                            console.log("no area found")
                        }

                        area.guid = index
                        item.guid = index;

                        await area.save();

                    }))
                    return arrayObj
                };

            }
        } else {
            return res.status(400).json({
                errors: [{ message: 'Internal Error, Please try again' }],
            })
        }
    } catch (e) {

        return res.status(400).json({
            err: errorHandler(e)
        });

    }

}

exports.saveAnimatedBanners = async function (req, res, next) {

    await uploadBannerImages(req, res, next);

    // save all urls
    await uploadBannerImageURLs(req, res, next)

    res.json(
        {
            urlsObjects: req.urls
        }
    )
}