/**
 * ThingAPI.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name:{
      type: 'string'
    },
    quantity:{
      type: 'integer'
    },
    status:{
      type: 'string'
    },
    type:{
      type: 'string'
    },
    warehouseSector:{
      model: 'warehouseSectorAPI'
    },
    order:{
      model: 'orderAPI'
    }
  }
};

