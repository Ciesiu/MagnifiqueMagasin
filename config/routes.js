/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */
const passport = require('passport');

const env = {
  AUTH0_CLIENT_ID: 'MSSVKVwIGMgqx1GZFMQ14JT8inSWDSar',
  AUTH0_DOMAIN: 'ciesiu.eu.auth0.com',
  AUTH0_CALLBACK_URL: 'http://localhost:1337/manageWares'
};

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  }
}


module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  // '/': {
  //   view: 'login'
  // },


  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

  'get /api/ware/add': 'WareAPIController.createNewWare',
  'get /api/ware/move': 'WareAPIController.moveWare',
  'get /api/ware/getByWarehouse': 'WareAPIController.getWaresByWarehouse',
  'get /api/ware/edit': 'WareAPIController.editWare',
  'get /api/ware/delete': 'WareAPIController.removeWare',
  'get /api/ware/getByOrder': 'WareAPIController.getWaresByOrder',
  'get /api/ware/addOrder': 'WareAPIController.addWareToOrder',
  'get /api/ware/removeOrder': 'WareAPIController.removeWareFromOrder',
  'get /api/ware/unloadDelivery': 'WareAPIController.unloadDelivery',
  'get /api/ware/getRaw': 'WareAPIController.getItemsRaw',


  'get /api/order/get': 'OrderAPIController.getOrders',
  'get /api/order/add': 'OrderAPIController.newOrder',
  'get /api/order/edit': 'OrderAPIController.editOrder',
  'get /api/order/delete': 'OrderAPIController.removeOrder',


  'get /api/warehouse/add': 'WarehouseAPIController.addWarehouse',
  'get /api/warehouse/getAll': 'WarehouseAPIController.getAllWarehouses',
  'get /api/warehouse/getAllCombo': 'WarehouseAPIController.getAllWarehousesCombo',
  'get /api/warehouse/edit': 'WarehouseAPIController.editWarehouse',
  'get /api/warehouse/delete': 'WarehouseAPIController.removeWarehouse',


  'get /api/sector/add': 'WarehouseSectorAPIController.addSector',
  'get /api/sector/getWHSectors': 'WarehouseSectorAPIController.getWHSectors',
  'get /api/sector/getWHSectorsNoPag': 'WarehouseSectorAPIController.getWHSectorsNoPagination',
  'get /api/sector/getWHSectorsCombo': 'WarehouseSectorAPIController.getWHSectorsCombo',
  'get /api/sector/edit': 'WarehouseSectorAPIController.editSector',
  'get /api/sector/delete': 'WarehouseSectorAPIController.removeSector',
  'get /api/sector/getFullNames': 'WarehouseSectorAPIController.getSectorsFullNamesCombo',

  //'get /api/user/check': 'LoginAPIController.checkUser',
  'get /api/user/add': 'LoginAPIController.addUser',
  'get /api/user/getAll': 'LoginAPIController.getAllUsers',
  'get /api/user/update': 'LoginAPIController.updateUser',
  'get /api/user/delete': 'LoginAPIController.removeUser',
  'get /api/user/changePasswd': 'LoginAPIController.changePasswd',
  'get /api/user/changeUserPasswd': 'LoginAPIController.changeUserPasswd',

  'get /api/delivery/get': 'SupplyDeliveryAPIController.getDeliveries',
  'get /api/delivery/getRaw': 'SupplyDeliveryAPIController.getDeliveriesRaw',
  'get /api/delivery/add': 'SupplyDeliveryAPIController.addDelivery',
  'get /api/delivery/getWares': 'SupplyDeliveryAPIController.getDeliveryWares',
  'get /api/delivery/delete': 'SupplyDeliveryAPIController.deleteDelivery',

  'get /api/requisition/get': 'SupplyOrderAPIController.getOrders',
  'get /api/requisition/add': 'SupplyOrderAPIController.addOrder',
  'get /api/requisition/getWares': 'SupplyOrderAPIController.getOrderWares',
  'get /api/requisition/delete': 'SupplyOrderAPIController.deleteOrder',
  'get /api/requisition/getRaw': 'SupplyOrderAPIController.getOrdersRaw',

  'GET /login':{
    view: 'login'
  },
  'POST /login': 'AuthController.login',
  '/logout': 'AuthController.logout',
  '/checkToken': 'AuthController.checkToken',
  'GET /register': { view: 'register' },
  // '/manageWares': [
  //   passport.authenticate('auth0', { failureRedirect: '/login' }),
  //   function(req, res) {
  //     if (!req.user) {
  //       throw new Error('user null');
  //     }
  //     res.redirect("/");
  //   }
  // ],
  // '/login': [
  //   passport.authenticate('auth0', {}),
  //   function (req, res) {
  //     res.redirect("/");
  //   }
  // ],
  '/manageUsers':{
    view: 'manageUsers'
  },
  '/manageSectors':{
    view: 'manageSectors'
  },
  '/manageWares':{
    view: 'manageWares'
  },
  '/manageOrders':{
    view: 'manageOrders'
  },
  '/manageReports':{
    view: 'manageReports'
  },
  '/manageRequisitions':{
    view: 'manageRequisitions'
  }
};
