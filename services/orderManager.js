const Order = require("../models/order");
const OrderDetails = require("../models/orderDetails");
const { Op } = require("sequelize");
const sequelize = require("../utils/database");

exports.create = async (orderObj = {}, orderDetailsObj = {}) => {
  let newOrder;
  let newOrderDetails;

  try {
    const result = await sequelize.transaction(async (t) => {
      newOrder = await Order.create(orderObj, { transaction: t });
      orderDetailsObj.orderId = newOrder.dataValues.id;

      newOrderDetails = await OrderDetails.create(orderDetailsObj, {
        transaction: t,
      });
    });
  } catch (err) {
    console.log(err);
    throw err;
  }

  return newOrder;
};

exports.listAll = async (id) => {
  let orders;

  try {
    orders = await Order.findAll({
      where: {
        [Op.or]: [{ userId: id }, { gasStationId: id }],
      },
      include: OrderDetails,
    });
  } catch (error) {
    console.log(error);
    throw err;
  }

  return orders;
};

exports.getOrderByID = async (id) => {
  let order, details;

  try {
    order = await Order.findByPk(
      id,
      { include: OrderDetails },
      {
        attributes: [
          "id",
          "gasStationId",
          "userId",
          "orderNumber",
          "shipAddress",
          "status",
          "createdAt",
        ],
      }
    );
  } catch (err) {
    console.log(err);
    throw err;
  }

  return order;
};

exports.getOrderByOrderNumber = async (userId, orderNumber) => {
  let order, details;

  try {
    order = await Order.findOne({
      where: {
        [Op.and]: [{ orderNumber: orderNumber }, { userId: userId }],
      },
      include: OrderDetails,
    });
  } catch (err) {
    console.log(err);
    throw err;
  }

  return order;
};

exports.updateOrderStatus = async (orderId, newStatus) => {
  let response;
  try {
    response = await Order.update(
      { status: newStatus },
      { where: { id: orderId } }
    );
  } catch (err) {
    console.log(err);
    throw err;
  }

  return response;
};
