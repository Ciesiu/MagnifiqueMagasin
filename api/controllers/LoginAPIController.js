/**
 * LoginAPIController
 *
 * @description :: Server-side logic for managing loginapis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('request');

module.exports = {
  /*
	checkAuth: function(req,res){
	  var login = req.param("login");
	  var pass = req.param("password");
	  var result = true;

    var address = 'http://localhost:1337/loginAPI?userName='+login+'&password='+pass;
    request(
      { method: 'GET',
        uri: address
      },
      function (error, response, body) {
        var data = JSON.parse(body);
        if(Object.keys(data).length === 0) result = false;
        return res.json({auth: result});
      }
    )
  },

  addUser: function(req,res){
	  var result = false;
    var login = req.param("login");
    var pass = req.param("password");
    var firstName = req.param("firstname");
    var lastName = req.param("lastname");
    var role = req.param("role");
    var userData = {};
    userData['userName'] = login;
    userData['password'] = pass;
    userData['firstName'] = firstName;
    userData['lastName'] = lastName;
    userData['role'] = role;

    var address = 'http://localhost:1337/loginAPI';
    request(
      { method: 'POST',
        uri: address,
        formData: userData
      },
      function (error, response, body) {
        if(response.statusCode==201) result = true;
        return res.json({created: result});
      }
    )
  },

  removeUser: function(req,res){
	  var result = false;
	  var userId = req.param('userId');
    var address = 'http://localhost:1337/loginAPI/'+userId;
    request(
      { method: 'DELETE',
        uri: address
      },
      function (error, response, body) {
        if(response.statusCode==200) result = true;
        return res.json({deleted: result});
      }
    )
  },

  updateUser: function(req,res){
	  var result = false;
	  var userId = req.param("userId");
    var login = req.param("login");
    var pass = req.param("password");
    var firstName = req.param("firstname");
    var lastName = req.param("lastname");
    var role = req.param("role");
    var userData = {};
    if(login) userData['userName'] = login;
    if(pass) userData['password'] = pass;
    if(firstName) userData['firstName'] = firstName;
    if(lastName) userData['lastName'] = lastName;
    if(role) userData['role'] = role;

    var address = 'http://localhost:1337/loginAPI/'+userId;
    request(
      { method: 'PUT',
        uri: address,
        formData: userData
      },
      function (error, response, body) {
        if(response.statusCode==200) result = true;
        return res.json({updated: result});
      }
    )
  },
  findUserTest: function(req,res){
	  var login = req.param("login");
	  LoginAPI.find({userName: login}).exec( function(err,users){
	    return res.json(users);
    })
  }*/
  authUser: function(req,res){
    var login = req.param("login");
    var pass = req.param("password");
    LoginAPI.count({userName:login,password:pass}).exec(function(err,found){
      if (err) {
        return res.serverError(err);
      }
      if(found>0){
        return res.json({auth: true})
      }
      return res.json({auth: false})
    })
  },

  changePasswd: function(req,res){
    var id = req.param("id");
    var oldPass = req.param("oldPassword");
    var newPass = req.param("newPassword");

    LoginAPI.findOne({id:id,password:oldPass}).exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      if(found){
        LoginAPI.update({id:id},{password:newPass}).exec(function(err){
          if(err){
            return res.serverError(err);
          }
          return res.ok();
        })
      }
      else{
        return res.serverError("Podano błędne hasło");
      }
    })
  },

  getAllUsers: function(req,res){
    var page = req.param("page");
    var rows = req.param("rows");
    LoginAPI.count({}).exec(function(err,count){
      if(err){
        return res.serverError(err);
      }
      LoginAPI.find({}).paginate({page:page,limit:rows}).exec(function(err,found){
        if(err){
          return res.serverError(err);
        }
        return res.json({rows:found,total:count});
      })
    })
  },

  checkUser: function(req,res){
    var login = req.param("login");
    var pass = req.param("password");
    LoginAPI.findOne({userName:login,password:pass}).exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      if(found) return res.json({found:found});
      else return res.json({found:'none'});
    })
  },

  addUser: function(req,res){
    var login = req.param("userName");
    var pass = req.param("password");
    var firstName = req.param("firstName");
    var lastName = req.param("lastName");
    var role = req.param("role");
    var userData = {};
    userData['userName'] = login;
    userData['password'] = pass;
    userData['firstName'] = firstName;
    userData['lastName'] = lastName;
    userData['role'] = role;
    LoginAPI.find({userName:login}).exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      if(found.length>0){
        return res.serverError("Podany login jest już zajęty");
      }
      else{
        LoginAPI.create(userData).exec(function(err,user){
          if (err) {
            return res.serverError(err);
          }
          return res.ok();
        })
      }
    })
  },

  removeUser: function(req,res){
    var userId = req.param('id');
    LoginAPI.destroy({id: userId}).exec(function(err){
      if (err) {
        return res.serverError(err);
      }
      return res.ok();
    })
  },

  updateUser: function(req,res){
    var userId = req.param('id');
    var login = req.param("userName");
    var pass = req.param("password");
    var firstName = req.param("firstName");
    var lastName = req.param("lastName");
    var role = req.param("role");
    var userData = {};
    if(login) userData['userName'] = login;
    if(pass) userData['password'] = pass;
    if(firstName) userData['firstName'] = firstName;
    if(lastName) userData['lastName'] = lastName;
    if(role) userData['role'] = role;
    LoginAPI.update({id: userId},userData).exec(function(err){
      if (err) {
        return res.serverError(err);
      }
      return res.ok();
    })
  }
};

