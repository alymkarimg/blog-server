var AnimatedBanner = require('../models/animatedBanner');
var AnimatedBannerItem = require('../models/animatedBannerItem');
var EditableArea = require('../models/editableArea');

exports.loadAnimatedBanner = async function (req, res, next) {
    var animatedBanner = await AnimatedBanner.findOne({ title: req.body.title });
    if (animatedBanner) {

        // if there are no assocaited images, create a placeholder 
        if (animatedBanner.items.length <= 0) {

            var editableArea = await EditableArea.findOne({ guid: `${0}`, pathname: animatedBanner.title })
            if (!editableArea) {
                editableArea = new EditableArea({
                    content: "<p>Coming Soon</p>",
                    pathname: animatedBanner.title,
                    guid: `${0}`
                });
            }
            await editableArea.save();

            var bannerItem = new AnimatedBannerItem({
                image: 'placeholder.png',
                EditableArea: editableArea,
                format: "image"
            });
            await bannerItem.save();

            animatedBanner.items.push(bannerItem);
            await animatedBanner.save();
        }

        await animatedBanner.populate('items').execPopulate();
        // if there are any images with no associated editable areas in the database, create an editable area for them
        animatedBanner.items.forEach(function (item, index) {
            if (!item.EditableArea) {

                var editableArea = new EditableArea({
                    content: "<p>Coming Soon</p>",
                    pathname: animatedBanner.title,
                    guid: `${index}`
                });

                item.EditableArea = editableArea;

            }
        })
        await animatedBanner.save();
        res.json(animatedBanner);
    } else {
        res.json({
            errors: [{ message: 'No banner with that title was found' }]
        })
    }
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