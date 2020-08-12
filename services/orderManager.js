const Order = require("../models/order");
const OrderDetails = require("../models/orderDetails");

exports.create = async (orderObj = {}, orderDetailsObj = {}) => {
  let newOrder;
  let newOrderDetails;

  try {
    newOrder = await Order.create(orderObj, orderDetailsObj);
    orderDetailsObj.orderId = newOrder.dataValues.id;

    newOrderDetails = await OrderDetails.create(orderDetailsObj);
  } catch (err) {
    console.log(err);
    throw err;
  }

  return newOrder;
};
