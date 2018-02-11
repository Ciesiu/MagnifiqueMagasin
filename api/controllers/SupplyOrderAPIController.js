/**
 * SupplyOrderAPIController
 *
 * @description :: Server-side logic for managing supplyorderapis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  getOrders: function(req,res){
    var page = req.param("page");
    var rows = req.param("rows");
    var sort = req.param("sort");
    var order = req.param("order");
    var sortString;
    if(sort&&order) sortString = sort+" "+order;
    else sortString = "id asc";

    SupplyOrderAPI.count({}).exec(function(err,count){
      if(err){
        return res.serverError(err);
      }
      SupplyOrderAPI.find({}).sort(sortString).paginate({page:page,limit:rows}).exec(function(err,found){
        if(err){
          return res.serverError(err);
        }
        return res.json({rows: found, total:count});
      })
    })
  },
  getOrderWares: function(req,res){
    var id = req.param('id');

    SupplyOrderAPI.findOne({id:id}).exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      return res.json(found.wares);
    })
  },
  addOrder: function(req,res){
    var waresObject = req.param('waresObject');

    SupplyOrderAPI.create({wares:JSON.stringify(waresObject)}).exec(function(err){
      if(err){
        return res.serverError(err);
      }
      return res.ok();
    })
  },
  deleteOrder: function(req,res){
    var id = req.param('id');

    SupplyOrderAPI.destroy({id:id}).exec(function(err){
      if(err){
        return res.serverError(err);
      }
      return res.ok();
    })
  }
};

