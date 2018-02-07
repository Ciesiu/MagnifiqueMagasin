/**
 * WarehouseSectorAPIController
 *
 * @description :: Server-side logic for managing warehousesectorapis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  getWHSectors: function(req,res){
    var whId = req.param("whId");
    var page = req.param("page");
    var rows = req.param("rows");
    var sort = req.param("sort");
    var order = req.param("order");
    var sortString;
    if(sort&&order) sortString = sort+" "+order;
    else sortString = "id asc";

    WarehouseSectorAPI.count({}).exec(function(err,count){
      if(err){
        return res.serverError(err);
      }
      WarehouseSectorAPI.find({warehouse:whId}).sort(sortString).paginate({page:page,limit:rows}).exec(function(err,found){
        if(err){
          return res.serverError(err);
        }
        return res.json({rows:found,total:count});
      })
    })
  },
  getWHSectorsNoPagination: function(req,res){
    var whId = req.param("whId");

    WarehouseSectorAPI.find({warehouse:whId}).exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      return res.json(found);
    })
  },
  getWHSectorsCombo: function(req,res){
    var whId = req.param("whId");
    WarehouseAPI.findOne({id:whId}).populate('sectors').exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      found.sectors.unshift({id:"",name:"wszystkie sektory", selected:"true"});
      return res.json(found.sectors);
    })
  },
  getSectorsFullNamesCombo: function(req,res){
    WarehouseSectorAPI.find({}).populate('warehouse').exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      if(found) {
        found.forEach(function(item,index){
          //console.log(item);
          item['comboName'] = item.warehouse.name+": "+item.name;
        })
      }
      return res.json(found);
    })
  },
  addSector: function(req,res){
    var warehouseId = req.param('warehouseId');
    var sectorName = req.param('name');
    WarehouseAPI.findOne({id: warehouseId}).populate('sectors').exec(function(err,warehouse){
      if(err){
        return res.serverError(err);
      }
      warehouse.sectors.add({name: sectorName});
      warehouse.save(function(err){
        if(err){
          return res.serverError(err);
        }
        return res.ok();
      })
    })
  },
  editSector:function(req,res){
    var sectorId = req.param('id');
    var name = req.param('name');

    WarehouseSectorAPI.update({id: sectorId},{name: name}).exec(function(err){
      if(err){
        return res.serverError(err);
      }
      return res.ok();
    })
  },
  removeSector: function(req,res){
    var sectorId = req.param('sectorId');
    WarehouseSectorAPI.findOne({id:sectorId}).populate("wares").exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      if(found.wares.length==0){
        WarehouseSectorAPI.destroy({id: sectorId}).exec(function(err){
          if(err){
            return res.serverError(err);
          }
          return res.ok();
        })
      }
      else{
        return res.serverError("Nie można usunąć - w sektorze znajduje się towar");
      }
    })
  }

};

