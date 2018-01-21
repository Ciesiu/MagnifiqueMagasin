/**
 * WarehouseSectorAPIController
 *
 * @description :: Server-side logic for managing warehousesectorapis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  getWHSectors: function(req,res){
    var whId = req.param("whId");
    WarehouseAPI.findOne({id:whId}).populate('sectors').exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      if(!found) return res.json({});
      return res.json(found.sectors);
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

