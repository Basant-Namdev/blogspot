const path = require('path');
const ejs = require('ejs');
const model = require('./model/userModel')
const users = model.users;

exports.renderView = async(req,res, viewPath, locals) => {
  const userProfile = await users.findById(req.user).select('name profile'); // Adjust the fields as necessary
  locals.userProfile = userProfile;
    const filePath = path.resolve(__dirname, `./views/${viewPath}.ejs`);
    ejs.renderFile(filePath, locals, function (err, str) {
      if (!err) {
        res.send(str);
      } else {
        console.log(err);
      }
    });
  }

  