import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { calculateCouponDiscount } from "./couponController.js";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  console.warn("⚠️ Razorpay environment variables are missing. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
}

console.log("Razorpay ENV Check:", {
  keyIdExists: !!razorpayKeyId,
  keyIdPrefix: razorpayKeyId?.slice(0, 8),
  secretExists: !!razorpayKeySecret,
  secretLength: razorpayKeySecret?.length,
});

function getRazorpayInstance() {
  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error("Razorpay environment variables RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required");
  }
  return new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
}

function getGatewayErrorMessage(error: any) {
  return (
    error?.error?.description ||
    error?.description ||
    error?.message ||
    "Failed to create Razorpay order"
  );
}

async function calculateServerAmount(items: any[], couponCode?: string) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart items are required");
  }

  let subtotal = 0;

  for (const item of items) {
    if (!item.variantId || !item.quantity || item.quantity <= 0) {
      throw new Error("Invalid cart item");
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
    });

    if (!variant) {
      throw new Error("Product variant not found");
    }

    if (variant.qty < item.quantity) {
      throw new Error(`Only ${variant.qty} items left in stock`);
    }

    subtotal += variant.price * item.quantity;
  }

  let discountAmount = 0;
  let finalAmount = subtotal;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    if (!coupon) {
      throw new Error("Coupon code is invalid");
    }

    discountAmount = calculateCouponDiscount(coupon, subtotal);
    finalAmount = subtotal - discountAmount;
  }

  return {
    subtotal,
    discountAmount,
    finalAmount,
  };
}

// POST /api/payments/razorpay/create-order
export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { items, couponCode } = req.body;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(500).json({
        success: false,
        error: "Razorpay credentials are missing on server",
      });
    }

    const amountData = await calculateServerAmount(items, couponCode);

    if (amountData.finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid payable amount",
      });
    }

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amountData.finalAmount * 100), // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: (req as any).user.id,
        couponCode: couponCode || "",
      },
    });

    console.log("Razorpay order created:", {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyPrefix: razorpayKeyId?.slice(0, 8),
    });

    await prisma.paymentLog.create({
      data: {
        amount: amountData.finalAmount,
        currency: "INR",
        status: "CREATED",
        paymentMethod: "RAZORPAY",
        gatewayOrderId: razorpayOrder.id,
      },
    });

    return res.json({
      success: true,
      keyId: razorpayKeyId,
      order: razorpayOrder,
      amount: amountData.finalAmount,
      discountAmount: amountData.discountAmount,
    });
  } catch (error: any) {
    console.error("Create Razorpay order error:", error);
    return res.status(500).json({
      success: false,
      error: getGatewayErrorMessage(error),
    });
  }
};

// POST /api/payments/razorpay/verify
export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpayKeySecret) {
      return res.status(500).json({
        success: false,
        error: "Razorpay key secret is missing on server",
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Missing Razorpay payment details",
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await prisma.paymentLog.updateMany({
        where: { gatewayOrderId: razorpay_order_id },
        data: {
          status: "FAILED",
          gatewayPaymentId: razorpay_payment_id,
          gatewaySignature: razorpay_signature,
          errorMessage: "Invalid Razorpay signature",
        },
      });

      return res.status(400).json({
        success: false,
        error: "Invalid payment signature",
      });
    }

    const updateResult = await prisma.paymentLog.updateMany({
      where: {
        gatewayOrderId: razorpay_order_id,
        paymentMethod: "RAZORPAY",
      },
      data: {
        status: "SUCCESS",
        gatewayPaymentId: razorpay_payment_id,
        gatewaySignature: razorpay_signature,
      },
    });

    if (updateResult.count === 0) {
      return res.status(404).json({
        success: false,
        error: "Payment log not found for this Razorpay order",
      });
    }

    return res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error: any) {
    console.error("Verify Razorpay payment error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Payment verification failed",
    });
  }
};
