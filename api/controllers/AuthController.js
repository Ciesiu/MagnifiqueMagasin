/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const passport = require('passport');
const crypto = require('crypto');

let token = null;

function generateToken(id){
  return new Promise(function(resolve, reject){
    User.findOne({id: id}).exec(function(err, found){
      if(err){
        //return null;
        resolve();
      }
      if(found){
        token = crypto.createHash('md5').update(found.userName+found.password).digest('hex');
        console.log(found);
        //return token;
        resolve();
      }
      else resolve();
    })
  })


}

module.exports = {
  login: async function(req, res) {
    passport.authenticate('local', function(err, user, info){
      if((err) || (!user)) {
        return res.send({
          message: info.message,
          user
        });
      }
      req.logIn(user, function(err) {
        if(err) res.send(err);
        console.log(user);
        generateToken(user.id)
          .then(function(){
            return res.send({
              message: info.message,
              user,
              token: token
            });
          })
      });
    })(req, res);
  },
  logout: function(req, res) {
    req.logout();
    res.redirect('/');
  },
  checkToken: async function(req, res){
    let id = req.param('id');
    let supplied = req.param('token');
    console.log("checkToken",id+" "+supplied);
    generateToken(id)
      .then(function() {
          if (supplied == token) {
            return res.send({status: 1});
          }
          else {
            return res.send({status: 2});
          }
        }
      )
  }
};

