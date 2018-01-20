/**
 * ThingAPIController
 *
 * @description :: Server-side logic for managing wareapis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('request');

module.exports = {
  getWarehouseWares: function(req,res){
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
          })
          return res.json({rows:found,total:count});
        })
      })

      //return res.json(found.sectors);
    })
  },

  getSectorWares: function(req,res){
    var secId = req.param("secId");
    WareAPI.find({warehouseSector:secId}).exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      return res.json(found);
    })
  },

  createNewWare: function(req,res){
    var name = req.param('name');
    var quantity = req.param('quantity');
    var status = req.param('status');
    var sectorId = req.param('warehouseSector');

    var wareData = {};
    wareData['name'] = name;
    //wareData['quantity'] = quantity;
    wareData['status'] = status;
    wareData['warehouseSector'] = sectorId;

    WareAPI.findOne(wareData).exec(function(err,found){
      if(err){
        return res.serverError(err);
      }
      //console.log(found);
      if(found){
        found.quantity = +found.quantity + +quantity;
        found.save(function(err){
          if(err){
            return res.serverError(err);
          }
          return res.ok();
        });
      }else{
        wareData['quantity'] = quantity;
        WareAPI.create(wareData).exec(function(err,ware){
          if (err) {
            return res.serverError(err);
          }
          return res.ok();
        })
      }
    })
    /*
    WareAPI.create(wareData).exec(function(err,ware){
      if (err) {
        return res.serverError(err);
      }
      return res.ok();
    })*/
  },

  removeWare: function(req,res){
    var wareId = req.param('id');
    WareAPI.destroy({id: wareId}).exec(function(err){
      if (err) {
        return res.serverError(err);
      }
      return res.json({deleted: wareId});
    })
  },

  editWare: function(req,res){
    var wareId = req.param('id');
    var name = req.param('name');
    var quantity = req.param('quantity');
    var status = req.param('status');
    var warehouseSector = req.param('warehouseSector');
    var order = req.param('order');

    var wareData = {};
    if(name) wareData['name'] = name;
    if(quantity) wareData['quantity'] = quantity;
    if(status) wareData['status'] = status;
    if(warehouseSector) wareData['warehouseSector'] = warehouseSector;
    if(order) wareData['order'] = order;

    WareAPI.update({id: wareId},wareData).exec(function(err){
      if (err) {
        return res.serverError(err);
      }
      return res.ok();
    })
  },

  splitWare: function(req,res){
    var wareId = req.param('wareId');
    var movedQuantity = req.param('movedQuantity');
    var newStatus = req.param('newStatus');
    var order = req.param('order')//opcjonalny
    WareAPI.findOne({id:wareId}).exec(function(err,ware){
      if(err) {
        return res.serverError(err);
      }
      if(ware.quantity==movedQuantity){ //jeśli przenosimy cały zapas danego itemu, zmiana statusu całego rekordu
        //sprawdzenie czy istnieje jakiś rekord który można skonsolidować
        var checkExistence = {};
        checkExistence['name'] = ware.name;
        checkExistence['warehouseSector'] = ware.warehouseSector;
        checkExistence['status'] = newStatus;
        if(order) checkExistence['warehouseSector'] = order;
        WareAPI.findOne(checkExistence).exec(function(err,foundWare) {
          if (err) {
            return res.serverError(err);
          }
          if(foundWare){
            //update znalezionego rekordu
            WareAPI.update({id:foundWare.id},{quantity:(+foundWare.quantity + +movedQuantity)}).exec(function(err){
              if(err){
                return res.serverError(err);
              }
              //usunięcie starego, niepotrzebnego rekordu
              WareAPI.destroy({id: wareId}).exec(function(err){
                if(err){
                  return res.serverError(err);
                }
                return res.ok();
              })
            })
          }
          else{
            WareAPI.update({id: wareId},{status:newStatus}).exec(function(err){
              if(err){
                return res.serverError(err);
              }
              return res.ok();
            })
          }
        })
      }
      else{ //dodanie nowego rekordu i zmiana ilości w starym
        //sprawdzenie czy istnieje jakiś rekord który można skonsolidować
        var checkExistence = {};
        checkExistence['name'] = ware.name;
        checkExistence['warehouseSector'] = ware.warehouseSector;
        checkExistence['status'] = newStatus;
        if(order) checkExistence['warehouseSector'] = order;
        WareAPI.findOne(checkExistence).exec(function(err,foundWare){
          if(err){
            return res.serverError(err);
          }
          if(foundWare){ //jeśli znaleziono rekord do skonsolidowania
            WareAPI.update({id:foundWare.id},{quantity:(+foundWare.quantity + +movedQuantity)}).exec(function(err){
              if(err){
                return res.serverError(err);
              }
              //zmiana ilosci w starym rekordzie
              WareAPI.update({id:wareId},{quantity:ware.quantity-movedQuantity}).exec(function(err){
                if(err){
                  return res.serverError(err);
                }
                return res.json({splitted: true});
              })
            })
          }
          else{ //jeśli nie znaleziono rekordu do skonsolidowania
            checkExistence['quantity'] = movedQuantity;
            WareAPI.create(checkExistence).exec(function(err){
              if(err){
                return res.serverError(err);
              }
              //zmiana ilosci w starym rekordzie
              WareAPI.update({id:wareId},{quantity:ware.quantity-movedQuantity}).exec(function(err){
                if(err){
                  return res.serverError(err);
                }
                return res.json({splitted: true});
              })
            })
          }
        })
      }
    })
  },

  moveWare: function(req,res){
    var wareId = req.param("wareId");
    var sectorId = req.param("sectorId");
    var quantity = req.param("quantity");

    WareAPI.findOne({id:wareId}).populate('warehouseSector').populate('order').exec(function(err,ware){ //znalezienie itemu
      if(err){
        return res.serverError(err);
      }
      WarehouseSectorAPI.findOne({id:sectorId}).populate('wares').exec(function(err,sector){ //znalezienie nowego sektora
        if(err){
          return res.serverError(err);
        }
        if(ware.quantity==quantity){ //jeśli przenosimy cały item
          //sprawdzenie czy można skonsolidować
          var query = 'SELECT * FROM wareapi WHERE name = \''+ware.name+'\' AND status = \''+ware.status+'\'';
          if(ware.order) query += ' AND wareapi.order = '+ ware.order.id;
          else query += ' AND wareapi.order IS NULL';
          query += ' AND warehouseSector = '+sector.id;
          //console.log(query);
          WareAPI.query(query,[],function(err,foundWare){
          //console.log(sector);
            if(err){
              return res.serverError(err);
            }
            if(foundWare.length>0){//znaleziono rekord do skonsolidowania
              console.log(foundWare);
              //console.log(sector);
              WareAPI.update({id:foundWare[0].id},{quantity: +foundWare[0].quantity + +quantity}).exec(function(err){
                if(err){
                  return res.serverError(err);
                }
                WareAPI.destroy({id:wareId}).exec(function(err){
                  if(err){
                    return res.serverError(err);
                  }
                  return res.json({moved: 'OK'})
                })

              })
            }
            else{
              ware.warehouseSector = sector; //zmiana sektora
              ware.save(function(err){
                if(err){
                  return res.serverError(err);
                }
                return res.json({moved: 'OK'});
              });
            }
          })
        }
        else{ //jeśli przenosimy tylko część itemu
          var newWare = {};
          //newWare['quantity'] = quantity;
          newWare['name'] = ware.name;
          newWare['status'] = ware.status;
          newWare['order'] = ware.order;
          //newWare['warehouseSector'] = sector;
          //sprawdzenie czy jest rekord do skonsolidowania
          //WareAPI.findOne(newWare).exec(function(err,foundWare) {
          var query = 'SELECT * FROM wareapi WHERE name = \''+ware.name+'\' AND status = \''+ware.status+'\'';
          if(ware.order) query += ' AND wareapi.order = '+ ware.order.id;
          else query += ' AND wareapi.order IS NULL';
          query += ' AND warehouseSector = '+sector.id;
          WareAPI.query(query,[],function(err,foundWare) {
            if (err) {
              return res.serverError(err);
            }
            if(foundWare.length>0){//jeśli znaleziono rekord do skonsolidowania
              WareAPI.update({id:foundWare[0].id},{quantity: +foundWare[0].quantity + +quantity}).exec(function(err){
                if(err){
                  return res.serverError(err);
                }
                WareAPI.update({id:wareId},{quantity: ware.quantity - quantity}).exec(function(err){
                  if(err){
                    return res.serverError(err);
                  }
                  return res.json({moved: 'OK'});
                })
              })
            }
            else{//jeśli nie znaleziono rekordu do skonsolidowania
              newWare['quantity'] = quantity;
              sector.wares.add(newWare);
              sector.save(function(err){ //dodanie nowego itemu w wybranym sektorze
                if(err){
                  return res.serverError(err);
                }
                ware.quantity = ware.quantity-quantity//zmiejszenie ilosci itemu w starym miejscu
                ware.save(function(err){
                  if(err){
                    return res.serverError(err);
                  }
                  return res.json({moved: 'OK'});
                })
              })
            }
          })
        }
      })
    })
  }
  /*
	createNewWare: function(req,res){
	  var result = false;
	  var name = req.param('name');
	  var quantity = req.param('quantity');
	  var status = req.param('status');

	  var wareData = {};
	  wareData['name'] = name;
	  wareData['quantity'] = quantity;
	  wareData['status'] = status;
	  wareData['warehouseSector'] = 0;
	  wareData['order'] = 0;

    var address = 'http://localhost:1337/wareAPI';
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

  editWare: function(req,res){
	  var result = false;
	  var wareId = req.param('wareId');
	  var name = req.param('name');
	  var quantity = req.param('quantity');
	  var status = req.param('status');
	  var warehouseSector = req.param('warehouseSector');
	  var order = req.param('order');

	  var wareData = {};
	  if(name) wareData['name'] = name;
	  if(quantity) wareData['quantity'] = quantity;
	  if(status) wareData['status'] = status;
	  if(warehouseSector) wareData['warehouseSector'] = warehouseSector;
	  if(order) wareData['order'] = order;

    var address = 'http://localhost:1337/wareAPI/'+wareId;
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

  splitWares: function(req,res){
	  var result = false;
    var oldId = req.param("wareId");
    var substractQuantity = req.param("subsQuantity");
    var newStatus = req.param("newStatus");
    var newOrder = req.param('newOrder'); //opcjonalne
    var oldWare = {};
	  //pobranie starego wpisu do obróbki
    var address = 'http://localhost:1337/wareAPI';
    request(
      { method: 'GET',
        uri: address+"/"+oldId
      },
      function (error, response, body) {
        if(response.statusCode==200){ //jeśli udało sie pobrać istniejący rekord
          oldWare = JSON.parse(body);
          var oldQuantity = oldWare.quantity;
          if (substractQuantity == oldQuantity) { //jeśli pobieramy 'cały zasób'
            //edycja statusu starego wpisu
            request( //req zmiana statusu starego wpisu
              {
                method: 'PUT',
                uri: address + "/" + oldId,
                formData: {status: newStatus}
              },
              function (error, response, body) {
                if (response.statusCode == 200) result = true;
                return res.json({splitted: result});
              }
            ) // /req zmiana statusu starego wpisu
          } else { //jeśli pobieramy tylko część zasobu
            //edycja statusu i ilości starego wpisu
            //przygotowanie nowego wpisu
            var newWare = {};
            newWare['name'] = oldWare['name'];
            newWare['warehouseSector'] = 0;
            newOrder ? newWare['order'] = newOrder : newWare['order'] = 0;
            newWare['status'] = newStatus;
            newWare['quantity'] = substractQuantity;
            ////////////////////////////
            request( //req zmiana ilości w starym zapisie
              {
                method: 'PUT',
                uri: address + "/" + oldId,
                formData: {quantity: (oldQuantity - substractQuantity)}
              },
              function (error, response, body) {
                if (response.statusCode == 200) {
                  console.log(response.statusCode);
                  //dodanie nowego wpisu
                  request( //req dodanie nowego wpisu
                    {
                      method: 'POST',
                      uri: address,
                      formData: newWare
                    },
                    function (error, response, body) {
                      console.log(response.statusCode);
                      if (response.statusCode == 201) result = true;
                      return res.json({splitted: result});
                    }
                  )// /req dodanie nowego wpisu
                }
                else return res.json({splitted: false});
              }
            )// /req zmiana ilości w starym zapisie
          }
        } // /jeśli udało sie pobrać rekord
        else return res.json({splitted: false});
      }
    )
  }*/

};

