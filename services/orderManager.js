const Order = require("../models/order");
const OrderDetails = require("../models/orderDetails");
const PaymentManger = require("./paymentManager");
const AccountManager = require("./accountManager");
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

  const user = await AccountManager.find(orderObj.userId);

  const customer = {
    email: user.dataValues.email,
    phoneNumber: user.dataValues.phoneNumber,
    name: user.profile.firstName + " " + user.profile.lastName,
  };

  // Initiate payment
  let initiatePaymentResponse;

  initiatePaymentResponse = await PaymentManger.initiate(
    orderObj.userId,
    newOrder.id,
    orderObj.orderNumber,
    orderDetailsObj.totalAmount,
    customer
  );

  const data = {
    order: newOrder,
    initiatePayment: initiatePaymentResponse.data,
  };

  return data;
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

  const payment = await order.getPayment();

  const data = {
    order: order,
    payment: payment,
  };

  return data;
};

exports.getOrderByOrderNumber = async (
  userId,
  orderNumber,
  gasStationId = null
) => {
  let order;

  try {
    order = await Order.findOne({
      where: {
        [Op.and]: [{ orderNumber: orderNumber }, { userId: userId }],
      },
      include: OrderDetails,
    });

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      error.message = "Order not found";
      error.data = [];
      throw error;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }

  const payment = await order.getPayment();

  const data = {
    order: order,
    payment: payment,
  };

  return data;
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
