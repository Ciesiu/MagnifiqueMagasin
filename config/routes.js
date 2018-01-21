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

  '/': {
    view: 'homepage'
  },

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

  'get /api/ware/split': 'WareAPIController.splitWare',
  'get /api/ware/add': 'WareAPIController.createNewWare',
  'get /api/ware/move': 'WareAPIController.moveWare',
  'get /api/ware/getSecWares': 'WareAPIController.getSectorWares',
  'get /api/ware/getWHWares': 'WareAPIController.getWarehouseWares',
  'get /api/ware/edit': 'WareAPIController.editWare',
  'get /api/ware/delete': 'WareAPIController.removeWare',



  'get /api/warehouse/add': 'WarehouseAPIController.addWarehouse',
  'get /api/warehouse/getAll': 'WarehouseAPIController.getAllWarehouses',
  'get /api/warehouse/getAllCombo': 'WarehouseAPIController.getAllWarehousesCombo',
  'get /api/warehouse/edit': 'WarehouseAPIController.editWarehouse',
  'get /api/warehouse/delete': 'WarehouseAPIController.removeWarehouse',


  'get /api/sector/add': 'WarehouseSectorAPIController.addSector',
  'get /api/sector/getWHSectors': 'WarehouseSectorAPIController.getWHSectors',
  'get /api/sector/getWHSectorsCombo': 'WarehouseSectorAPIController.getWHSectorsCombo',
  'get /api/sector/edit': 'WarehouseSectorAPIController.editSector',
  'get /api/sector/delete': 'WarehouseSectorAPIController.removeSector',

  'get /api/user/check': 'LoginAPIController.checkUser',
  'get /api/user/add': 'LoginAPIController.addUser',
  'get /api/user/getAll': 'LoginAPIController.getAllUsers',
  'get /api/user/update': 'LoginAPIController.updateUser',
  'get /api/user/delete': 'LoginAPIController.removeUser',
  'get /api/user/changePasswd': 'LoginAPIController.changePasswd',

  '/login':{
    view: 'login'
  },
  '/manageUsers':{
    view: 'manageUsers'
  },
  '/manageSectors':{
    view: 'manageSectors'
  },
  '/manageWares':{
    view: 'manageWares'
  }
};
