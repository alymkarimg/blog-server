var AnimatedBanner = require('../models/animatedBanner');
var AnimatedBannerItem = require('../models/animatedBannerItem');
var EditableArea = require('../models/editableArea');
const { errorHandler } = require('../helpers/dbErrorHandler');
const { body } = require('express-validator');
const animatedBannerItem = require('../models/animatedBannerItem');
const editableArea = require('../models/editableArea');

exports.loadAnimatedBanner = async function (req, res, next) {
    var animatedBanner = await AnimatedBanner.findOne({ title: req.params.title });

    // if there is no editable area, create one
    if (!animatedBanner) {
        animatedBanner = AnimatedBanner.createBanner(req.params.title)
    }

    await animatedBanner.populate('items').execPopulate();
    await animatedBanner.populate('items.EditableArea').execPopulate();

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

        var bannerItem = new AnimatedBannerItem({
            pathname: animatedBanner.title,
            guid: 0,
            image: 'placeholder.png',
            EditableArea: editableArea,
            format: "image"
        });

        animatedBanner.items.push(bannerItem);
        await bannerItem.save();
    }

    await animatedBanner.save();
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
        await animatedBanner.populate('items.EditableArea').execPopulate();

        // slide number
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
                image: 'placeholder.png',
                EditableArea: editableArea,
                format: "image"
            });
            animatedBanner.items.push(bannerItem);
            bannerItem.save();
        }

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
                await AnimatedBannerItem.deleteOne({ pathname: banner.title, guid: req.body.slideNumber })
                await EditableArea.deleteOne({ pathname: banner.title, guid: req.body.slideNumber })

                await banner.populate('items').execPopulate();
                await banner.populate('items.EditableArea').execPopulate();

                // delete the deleted current slide from the list
                banner.items = banner.items.filter(q => q.guid != (req.body.slideNumber))

                // // renumber all items in the array
                // await Promise.all(banner.items.forEach(async (element, index) => {

                //     // find the editable area
                //     var editableArea = element.EditableArea;

                //     // set new indexes
                //     editableArea.guid = index;
                //     element.guid = index

                //     await editableArea.save();
                //     await element.save();
                // })
                // );

                var items = await array_values(banner.items)

                await Promise.all(items.map(async (item, index) => {
                    await item.save();
                }))

                banner.items = items;

                await banner.save();

                res.json({ message: "Slide deleted", banner });

                async function array_values(arrayObj) {

                    var e = arrayObj.sort(dynamicSort("guid"))

                    arrayObj.sort(dynamicSort("guid"))
                    await Promise.all(arrayObj.map(async (item, index) => {
                        var area = await EditableArea.findOne({guid: item.guid, pathname: item.pathname})
                        area.guid = index
                        await area.save();
                        item.guid = index;
                        item.EditableArea.guid = index;
                    }))
                    return arrayObj

                    function dynamicSort(property) {
                        var sortOrder = 1;
                        if (property[0] === "-") {
                            sortOrder = -1;
                            property = property.substr(1);
                        }
                        return function (a, b) {
                            /* next line works with strings and numbers, 
                             * and you may want to customize it to your needs
                             */
                            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                            return result * sortOrder;
                        }
                    }
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