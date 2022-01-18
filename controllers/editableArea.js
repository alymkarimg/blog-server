var EditableArea = require("../models/editableArea");
const Menu = require("../models/menu");
var async = require("async");
const AWS = require("aws-sdk");

exports.createPage = async function (req, res, next) {
  var page = await EditableArea.createPage(req.body);
  console.log(page);
  await page.save();
  res.status(200).json(page);
};

exports.loadEditableArea = async function (editableArea, url) {
  // if all menuitems contains a URL with the pathname, create an editable area
<<<<<<< HEAD
  var menuitem = await Menu.findOne({ url :url.substring(1) });
=======
  //TODO: get all data in single api call using find

  var menuitem = await Menu.findOne({ url: req.body.url.substring(1) });
>>>>>>> cba46a8f605e8ac2fdc7da8037053899d45a8772
  if (
    (menuitem && editableArea && editableArea.isEditablePage == true) ||
    editableArea && editableArea.isEditablePage == false
  ) {
    var EditableAreaModel = await EditableArea.findOne({
      pathname: editableArea.pathname,
      guid: editableArea.guid,
    });
    if (!EditableAreaModel) {
      EditableAreaModel = new EditableArea({
        content: "<p>Coming Soon</p>",
        pathname: editableArea.pathname,
        guid: editableArea.guid,
        link: editableArea.link,
      });
      EditableAreaModel.save();
    }
    return EditableAreaModel
  } 
  else {
    return {
      message: "no page with that URL was found",
      guid: editableArea.guid,
      pathname: editableArea.pathname
    };
  }
};

exports.loadAllEditableAreas = async function (req, res, next) {

  let editableAreas = await Promise.all(
    req.body.editableAreas.map(async (editableArea) => {
      let editableAreaModel = exports.loadEditableArea(editableArea, req.body.url);
      return editableAreaModel;
    })
  );
  return res.json([...editableAreas]);
};

exports.saveEditableArea = async function (req, res, next) {
  var areas = await EditableArea.find();
  var areasToSave = [];

  req.body.editableAreas.forEach((element) => {
    // find db area which matches each item in array
    var editableArea = areas.find(function (dbarea) {
      return dbarea.pathname == element.pathname && dbarea.guid == element.guid;
    });

    // save to db
    if (
      (editableArea && editableArea.content != element.data && element.data != undefined) ||
      editableArea.link != element.link
    ) {
      editableArea.content = element.data;
      editableArea.link = element.link;
      areasToSave.push(editableArea);
    }
  });

  // save all editable areas in array
  if (areasToSave.length > 0) {
    async.each(areasToSave, function (area, callback) {
      area.save();
      callback();
    });
  }

  res.json({
    areasToSave,
  });
};
