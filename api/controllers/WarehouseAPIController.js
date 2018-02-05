/**
 * WarehouseAPIController
 *
 * @description :: Server-side logic for managing warehouseapis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  getAllWarehouses: function(req,res){
    var page = req.param("page");
    var rows = req.param("rows");
    var sort = req.param("sort");
    var order = req.param("order");
    var sortString;
    if(sort&&order) sortString = sort+" "+order;
    else sortString = "id asc";

    WarehouseAPI.count({}).exec(function(err,count){
      if(err){
        return res.serverError(err);
      }
      WarehouseAPI.find({}).sort(sortString).paginate({page:page,limit:rows}).exec(function(err,found){
        if(err){
          return res.serverError(err);
        }
        return res.json({rows:found,total:count});
      })
    })
  },
  getAllWarehousesCombo: function(req,res){
    WarehouseAPI.find({}).exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      found[0]['selected'] = "true";
      return res.json(found);
    })
  },
  addWarehouse: function(req,res){
    var name = req.param('name');
    var address = req.param('address');

    var wareData = {};
    wareData['name'] = name;
    wareData['address'] = address;
    WarehouseAPI.find({name:name}).exec(function(err,found){
      if(err){
        return res.serverError(err)
      }
      if(found.length>0){
        return res.serverError("Magazyn o podanej nazwie już istnieje");
      }
      else{
        WarehouseAPI.create(wareData).exec(function(err,warehouse){
          if(err){
            return res.serverError(err);
          }
          //return res.json({created: warehouse.id});
          WarehouseSectorAPI.create({name:'Rampa',warehouse:warehouse}).exec(function(err,sector){
            if(err){
              return res.serverError(err);
            }
            return res.ok();
          })
        })
      }
    })
  },

  removeWarehouse: function(req,res){
    var warehouseId = req.param('warehouseId');
    WarehouseSectorAPI.find({warehouse: warehouseId}).populate("wares").exec(function(err,found) {
      if (err) {
        return res.serverError(err);
      }
      var secIDs = [];
      var canRemove = true;
      found.forEach(function (item) {
        if (item.wares.length > 0){
          canRemove = false;
        }
        secIDs.push(item.id);
      })
      if (canRemove){
        WarehouseAPI.destroy({id: warehouseId}).exec(function (err) {
          if (err) {
            return res.serverError(err);
          }
          //return res.json({updated: warehouseId});
          WarehouseSectorAPI.destroy({id: secIDs}).exec(function (err) {
            if (err) {
              return res.serverError(err);
            }
            return res.ok();
          })
        })
    }
    else{
        return res.serverError("Nie można usunać - w magazynie znajduje się towar")
      }
    })


  },

  editWarehouse: function(req,res){
    var warehouseId = req.param('warehouseId');
    var name = req.param('name');
    var address = req.param('address');

    WarehouseAPI.update({id: warehouseId},{name:name,address:address}).exec(function(err){
      if(err){
        return res.serverError(err);
      }
      return res.ok();
    })
  }
  /*
	addWarehouse: function(req,res){
	  var result = false;
	  var name = req.param('name');
	  var address = req.param('address');

	  var wareData = {};
	  wareData['name'] = name;
	  wareData['address'] = address;

    var address = 'http://localhost:1337/warehouseAPI';
    request(
      { method: 'POST',
        uri: address,
        formData: wareData
      },
      function (error, response, body) {
        if(response.statusCode==201) result = true;
        return res.json({created: result});
      }
    )
  },
  editWarehouse: function(req,res){
    var result = false;
    var warehouseId = req.param('warehouseId');
    var name = req.param('name');
    var address = req.param('address');

    var wareData = {};
    if(name) wareData['name'] = name;
    if(address) wareData['address'] = address;

    var address = 'http://localhost:1337/warehouseAPI/'+warehouseId;
    request(
      { method: 'PUT',
        uri: address,
        formData: wareData
      },
      function (error, response, body) {
        if(response.statusCode==200) result = true;
        return res.json({updated: result});
      }
    )
  },

  removeWarehouse: function(req,res){
    var result = false;
    var warehouseId = req.param('warehouseId');
    var address = 'http://localhost:1337/warehouseAPI/'+warehouseId;
    request(
      { method: 'DELETE',
        uri: address
      },
      function (error, response, body) {
        if(response.statusCode==200) result = true;
        return res.json({deleted: result});
      }
    )
  }*/
};

