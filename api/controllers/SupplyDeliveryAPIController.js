/**
 * SupplyDeliveryAPIController
 *
 * @description :: Server-side logic for managing supplydeliveryapis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  /*addItemToDelivery: function(req,res){
    var id = req.param('id');
    var name = req.param('name');
    var quantity = req.param('quantity');
    var sectorId = req.param('sectorId');

    var itemObject = {};
    itemObject["name"] = name;
    itemObject['quantity'] = quantity;
    itemObject['warehouseSector'] = sectorId;

    SupplyDeliveryAPI.findOne({id:id}).exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      if(found){
        found.wares.push(itemObject);
      }
    })


  },*/
	getDeliveries: function(req,res){
    var page = req.param("page");
    var rows = req.param("rows");
    var sort = req.param("sort");
    var order = req.param("order");
    var sortString;
    if(sort&&order) sortString = sort+" "+order;
    else sortString = "id asc";

	  SupplyDeliveryAPI.count({}).exec(function(err,count){
	    if(err){
	      return res.serverError(err);
      }
      SupplyDeliveryAPI.find({}).sort(sortString).paginate({page:page,limit:rows}).exec(function(err,found){
        if(err){
          return res.serverError(err);
        }
        return res.json({rows: found, total:count});
      })
    })
  },
  getDeliveryWares: function(req,res){
	  var id = req.param('id');

	  SupplyDeliveryAPI.findOne({id:id}).exec(function(err,found){
	    if(err){
	      return res.serverError(err);
      }
      return res.json(found.wares);
    })
  },
  addDelivery: function(req,res){
    var waresObject = req.param('waresObject');

	  SupplyDeliveryAPI.create({wares:JSON.stringify(waresObject)}).exec(function(err){
	    if(err){
	      return res.serverError(err);
      }
      return res.ok();
    })
  },
  /*saveDelivery: function(req,res){
	  var id = req.param('id');
	  var waresObject = req.param('waresObject');

	  SupplyDeliveryAPI.findOne({id:id}).exec(function(err,found){
	    if(err){
	      return res.serverError(err);
      }
      found.wares = waresObject;
	    found.save(function(err){
	      if(err){
	        return res.serverError(err);
        }
        //ToDo
        //pakowanie do bazy

        return res.ok();
      })
    })
  },*/
  deleteDelivery: function(req,res){
	  var id = req.param('id');

	  SupplyDeliveryAPI.destroy({id:id}).exec(function(err){
	    if(err){
	      return res.serverError(err);
      }
      return res.ok();
    })
  }
};

