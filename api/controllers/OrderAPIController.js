/**
 * OrderAPIController
 *
 * @description :: Server-side logic for managing orderapis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  newOrder: function(req,res){
    var wares = req.param('wares');
    var personName = req.param('personName');

    var orderData = {};
    orderData['user'] = personName;
    orderData['status'] = 'pending';
    OrderAPI.create(orderData).exec(function(err,order){
      if(err){
        return res.serverError(err);
      }
      var query = [];
      wares.forEach(function(item,index){
        query.push({id: item});
      })
      WareAPI.find({or: query}).exec(function(err,found){
        if(err){
          return res.serverError(err);
        }
        found.forEach(function(item,index){
          order.wares.add(item);
        })
        order.save(function(err){
          if(err){
            return res.serverError(err);
          }
          return res.json({created: order.id});
        })
      })
    })
  },
  changeOrderStatus: function(req,res){
    var orderId = req.param('orderId');
    var newStatus = req.param('newStatus');

    OrderAPI.update({id: orderId},{status: newStatus}).exec(function(err){
      if(err){
        res.serverError(err);
      }
      res.json({updated: orderId});
    })
  }
};

