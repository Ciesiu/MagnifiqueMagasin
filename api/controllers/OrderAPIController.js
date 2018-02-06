/**
 * OrderAPIController
 *
 * @description :: Server-side logic for managing orderapis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  getOrders: function(req,res){
    var page = req.param("page");
    var rows = req.param("rows");
    var sort = req.param("sort");
    var order = req.param("order");
    var status = req.param("status");
    var search = {};
    if(status) search["status"] = status;
    var sortString;
    if(sort&&order) sortString = sort+" "+order;
    else sortString = "id asc";
    OrderAPI.count(search).exec(function(err,count){
      if(err){
        return res.serverError(err);
      }
      OrderAPI.find(search).sort(sortString).paginate({page:page,limit:rows}).exec(function(err,found){
        if(err){
          return res.serverError(err);
        }
        return res.json({rows:found,total:count});
      })
    })
  },
  newOrder: function(req,res){
    var personName = req.param('user');

    var orderData = {};
    orderData['user'] = personName;
    orderData['status'] = 'otwarte';
    OrderAPI.create(orderData).exec(function(err,order){
      if(err){
        return res.serverError(err);
      }
      return res.ok();
    })
  },
  editOrder: function(req,res){
    var orderId = req.param('id');
    var newStatus = req.param('status');
    var newUser = req.param('user');

    var orderData = {};
    if(newStatus) orderData['status'] = newStatus;
    if(newUser) orderData['user'] = newUser;

    OrderAPI.findOne({id:orderId}).exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      var oldStatus = found.status
      if(oldStatus=='zamkniete') return res.serverError("Nie można edytować zamkniętego zamówienia");
      OrderAPI.update({id: orderId},orderData).exec(function(err){
        if(err){
          res.serverError(err);
        }
        if(newStatus){
          if(oldStatus != newStatus && newStatus == 'zamkniete'){
            WareAPI.update({order:orderId},{status:'niedostepne'}).exec(function(err){
              if(err){
                res.serverError(err);
              }
              return res.ok();
            })
          }
        }
        res.ok();
      })
    })
  },
  removeOrder: function(req,res){
    var id = req.param('id');
    OrderAPI.findOne({id:id}).populate("wares").exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      if(found){
        found.wares.forEach(function(item){
          item.status = "available";
        })
        found.save(function(err){
          if(err){
            return res.serverError(err);
          }
          OrderAPI.destroy({id:id}).exec(function(err){
            if(err){
              return res.serverError(err);
            }
            return res.ok();
          })
        })
      }
      else return res.ok();
    })
  }
};

