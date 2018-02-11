/**
 * ThingAPIController
 *
 * @description :: Server-side logic for managing wareapis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

function consolidateWares(res){
  WareAPI.find({}).exec(function(err,found){
    //console.log("konsolidacja.find")
    if(err) return res.serverError(err);
    var duplicates = [];
    var waresLength = found.length;

    found.forEach(function(item,index){ //przygotowanie tablicy duplikatów
      //console.log("konsolidacja.forEach")
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
      //console.log("forEachDuplicate")
      counter--;
      var from = item.from;
      var to = item.to;
      found[to].quantity = +found[to].quantity + found[from].quantity;
      found[to].save(function(err){
        if(err) return res.serverError(err);
        found[from].quantity = 0;
        found[from].save(function(err){
          if(err) return res.serverError(err);
          if(counter==0){
            WareAPI.destroy({quantity:0}).exec(function(err){ //usunięcie wyzerowanych pozycji
              if(err) return res.serverError(err);
              return res.ok();
            })
          }
        })
      })
    })
    return res.ok();
  })
}

module.exports = {

  unloadDelivery: function(req,res){
    var delObj = req.param('waresObject');
    //console.log(delObj);
    //delObj = JSON.parse(delObj);
    if(delObj) {
      delObj.forEach(function (item) {
        delete item.warehouseSectorName;
        item['status'] = 'dostepne';
      })
      WareAPI.create(delObj).exec(function (err) {
        if (err) {
          return res.serverError(err);
        }
        consolidateWares(res);
      })
    }
    else return res.serverError("Nie można zapisać pustej dostawy");
  },

  getWaresByOrder: function(req,res){
    var page = req.param("page");
    var rows = req.param("rows");
    var orderId = req.param("orderId");
    var sort = req.param("sort");
    var order = req.param("order");
    var sortString;
    if(sort&&order) sortString = sort+" "+order;
    WareAPI.count({order:orderId}).exec(function(err,count){
      if(err){
        return res.serverError(err);
      }
      WareAPI.find({order:orderId}).populate('warehouseSector').sort(sortString).paginate({page:page,limit:rows}).exec(function(err,found){
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
  },
  getWaresByWarehouse: function(req,res){
    var whId = req.param("whId");
    var name = req.param("name");
    var sectorId = req.param("sectorId");
    var page = req.param("page");
    var rows = req.param("rows");
    var sort = req.param("sort");
    var order = req.param("order");
    var sortString;
    if(sort&&order) sortString = sort+" "+order;
    else sortString = "id asc";
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
        WareAPI.find(params).populate('warehouseSector').sort(sortString).paginate({page:page,limit:rows}).exec(function(err,found){
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
      consolidateWares(res);
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

    WareAPI.findOne({id: wareId}).exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      if(name) found.name = name;
      if(quantity) found.quantity = quantity;
      if(status){
        if(found.order){
            return res.serverError("Nie można edytować towaru znajdującego się w zamówieniu");
        }
        else{
          found.status = status;
        }
      }
      found.save(function(err){
        if(err){
          return res.serverError(err);
        }
        consolidateWares(res);
      })
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
        found.warehouseSector = sectorId;
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
            consolidateWares(res);
          })
        })
      }
    })
  },

  addWareToOrder: function(req,res){
    var wareId = req.param("id");
    var orderId = req.param("orderId");
    var quantity = req.param("quantity");

    WareAPI.findOne({id:wareId}).exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      OrderAPI.findOne({id:orderId}).exec(function(err,foundOrder){
        if(err){
          return res.serverError(err);
        }
        if(foundOrder.status != 'otwarte'){
          return res.serverError("Wybrane zamówienie nie jest otwarte i nie może być modyfikowane");
        }
        if(+quantity > +found.quantity){
          return res.serverError("Nie można przenieść ilości większej niż dostępna");
        }
        if(found.status != 'dostepne'){
          return res.serverError("Wybrany towar nie jest dostępny");
        }
        else if(quantity==found.quantity){ //zmieniamy status całości
          found.order = orderId;
          found.status = 'zamowione';
          found.save(function(err){
            if(err){
              return res.serverError(err);
            }
            return res.ok();
          })
        }
        else{ //zmieniamy status części
          var newWare = {};
          newWare['name'] = found.name;
          newWare['quantity'] = quantity;
          newWare['order'] = orderId;
          newWare['warehouseSector'] = found.warehouseSector;
          newWare['status'] = 'zamowione';
          WareAPI.create(newWare).exec(function(err){
            if(err){
              return res.serverError(err);
            }
            found.quantity = +found.quantity - +quantity;
            found.save(function(err){
              if(err){
                return res.serverError(err);
              }
              consolidateWares(res);
            })
          })
        }
      })
    })
  },

  removeWareFromOrder: function(req,res){
    var wareId = req.param("id");

    WareAPI.update({id:wareId},{status:"dostepne",order:null}).exec(function(err){
      if(err){
        return res.serverError(err);
      }
      consolidateWares(res);
    })
  },


};

