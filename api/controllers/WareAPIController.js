/**
 * ThingAPIController
 *
 * @description :: Server-side logic for managing wareapis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

function consolidateWares(){
  WareAPI.find({}).exec(function(err,found){
    if(err) return err;
    var duplicates = [];
    var waresLength = found.length;
    found.forEach(function(item,index){ //przygotowanie tablicy duplikatów
      var itemName = item.name;
      var itemStatus = item.status;
      var itemOrder = item.order;
      var itemSector = item.warehouseSector;
      for(var i=+index+1;i<waresLength;i++){
        var dup = true;
        if(itemName != found[i].name) dup=false;
        if(itemStatus != found[i].status) dup=false;
        if(itemOrder != found[i].order) dup=false;
        if(itemSector != found[i].warehouseSector) dup=false;
        if(dup){
          duplicates.push({from: i, to: index});
        }
      }
    })
    //scalenie duplikatów
    var counter = duplicates.length;
    duplicates.forEach(function(item){ //sumowanie ilości, zerowanie jednej z pozycji
      counter--;
      var from = item.from;
      var to = item.to;
      found[to].quantity = +found[to].quantity + found[from].quantity;
      found[to].save(function(err){
        if(err) return err;
        found[from].quantity = 0;
        found[from].save(function(err){
          if(err) return err;
          if(counter==0){
            WareAPI.destroy({quantity:0}).exec(function(err){ //usunięcie wyzerowanych pozycji
              if(err) return err;
              return "ok";
            })
          }
        })
      })
    })
  })
}

module.exports = {

  getWaresByOrder: function(req,res){
    var page = req.param("page");
    var rows = req.param("rows");
    var orderId = req.param("orderId");
    WareAPI.find({order:orderId}).paginate({page:page,limit:rows}).exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      return res.json(found);
    })
  },
  getWaresByWarehouse: function(req,res){
    var whId = req.param("whId");
    var name = req.param("name");
    var sectorId = req.param("sectorId");
    var page = req.param("page");
    var rows = req.param("rows");
    WarehouseAPI.findOne({id:whId}).populate('sectors').exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      var sectorIDs = [];
      if(!found) return res.json({});
      found.sectors.forEach(function(item){
        sectorIDs.push(item.id);
      })
      //console.log(sectorIDs);
      var params = {};
      params["warehouseSector"] = sectorIDs;
      if(name) params["name"] = {contains: name};
      if(sectorId) params["warehouseSector"] = sectorId;
      WareAPI.count(params).exec(function(err,count){
        if(err){
          return res.serverError(err);
        }
        WareAPI.find(params).populate('warehouseSector').paginate({page:page,limit:rows}).exec(function(err,found){
          if(err){
            return res.serverError(err);
          }
          found.forEach(function(item){
            item["sectorName"] = item.warehouseSector.name;
            item["warehouseSector"] = item.warehouseSector.id;
          })
          return res.json({rows:found,total:count});
        })
      })
    })
  },

  createNewWare: function(req,res){
    var name = req.param('name');
    var quantity = req.param('quantity');
    var warehouseSector = req.param('warehouseSector');

    WareAPI.create({name:name,quantity:quantity,warehouseSector:warehouseSector,status:"dostepne"}).exec(function(err){
      if(err){
        return res.serverError(err);
      }
      var consolidation = consolidateWares();
      if(consolidation=='ok'){
        return res.ok();
      }
      else{
        return res.serverError(consolidation);
      }
    })
  },

  removeWare: function(req,res){
    var wareId = req.param('id');
    WareAPI.destroy({id: wareId}).exec(function(err){
      if (err) {
        return res.serverError(err);
      }
      return res.ok();
    })
  },

  editWare: function(req,res){
    var wareId = req.param('id');
    var name = req.param('name');
    var quantity = req.param('quantity');
    var status = req.param('status');

    var wareData = {};
    if(name) wareData['name'] = name;
    if(quantity) wareData['quantity'] = quantity;
    if(status) wareData['status'] = status;

    WareAPI.update({id: wareId},wareData).exec(function(err){
      if (err) {
        return res.serverError(err);
      }
      var consolidation = consolidateWares();
      if(consolidation=='ok'){
        return res.ok();
      }
      else{
        return res.serverError(consolidation);
      }
    })
  },

  moveWare: function(req,res){
    var wareId = req.param("id");
    var sectorId = req.param("warehouseSector");
    var quantity = req.param("quantity");
    //console.log(req.params.all());

    WareAPI.findOne({id:wareId}).exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      if(+quantity > +found.quantity){
        return res.serverError("Nie można przenieść ilości większej niż dostępna");
      }
      else if(quantity==found.quantity){ //przenosimy cały
        //console.log("przenosiny")
        //console.log(found)
        //console.log(sectorId)
        found.warehouseSector = sectorId;
        //console.log(found)
        found.save(function(err){
          if(err){
            return res.serverError(err);
          }
          return res.ok();
        })
      }
      else{ //przenosimy część
        var newWare = {};
        newWare['name'] = found.name;
        newWare['quantity'] = quantity;
        newWare['order'] = found.order;
        newWare['warehouseSector'] = sectorId;
        newWare['status'] = found.status;
        WareAPI.create(newWare).exec(function(err){
          if(err){
            return res.serverError(err);
          }
          found.quantity = +found.quantity - +quantity;
          found.save(function(err){
            if(err){
              return res.serverError(err);
            }
            var consolidation = consolidateWares();
            if(consolidation=='ok'){
              return res.ok();
            }
            else{
              return res.serverError(consolidation);
            }
          })
        })
      }
    })
  },

  addWareToOrder: function(req,res){
    var wareId = req.param("id");
    var orderId = req.param("orderId");

    WareAPI.update({id:wareId},{status:"zamowione",order:orderId}).exec(function(err){
      if(err){
        return res.serverError(err);
      }
      var consolidation = consolidateWares();
      if(consolidation=='ok'){
        return res.ok();
      }
      else{
        return res.serverError(consolidation);
      }
    })
  },

  removeWareFromOrder: function(req,res){
    var wareId = req.param("id");

    WareAPI.update({id:wareId},{status:"dostepne",order:null}).exec(function(err){
      if(err){
        return res.serverError(err);
      }
      var consolidation = consolidateWares();
      if(consolidation=='ok'){
        return res.ok();
      }
      else{
        return res.serverError(consolidation);
      }
    })
  },


};

