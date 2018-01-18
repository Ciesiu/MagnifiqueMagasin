/**
 * SupplyDeliveryAPIController
 *
 * @description :: Server-side logic for managing supplydeliveryapis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	addSupplyDelivery: function(req,res){
    var wares = req.param('waresObject');

    SupplyDeliveryAPI.create({wares: wares}).exec(function(err,created){
      if(err){
        res.serverError(err);
      }
      res.json({created: created.id});
    })
  }
};

