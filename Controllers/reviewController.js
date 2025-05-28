const Review = require("../Model/reviewModel");
const Notification = require("../Model/notificationModel");
const db = require("../Config/db");

exports.addReview = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id, order_id, rating, comment } = req.body;

    if (!product_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Please enter a rating from 1 to 5 and the product number.",
      });
    }

    const reviewData = {
      user_id,
      product_id,
      order_id,
      rating,
      comment,
    };

    if (order_id) {
      const alreadyReviewed = await Review.hasAlreadyReviewedOrder(user_id, order_id);
      if (alreadyReviewed) {
        return res.status(400).json({ error: "You already reviewed this order." });
      }
    }
    if (order_id) {
      const alreadyReviewed = await Review.hasAlreadyReviewedOrder(user_id, order_id);
      if (alreadyReviewed) {
        return res.status(400).json({ error: "You already reviewed this order." });
      }
    }



    const result = await Review.addReview(reviewData);

    // 🔄 جلب صاحب المنتج
    const artisan_id = await Review.getProductOwnerId(product_id);
    if (artisan_id) {

      // 🔔 إنشاء إشعار لصاحب المنتج
      const message = `A user has added a new review with a rating of ${rating} stars${comment ? ` and a comment: "${comment}"` : ""}`;
      await Notification.createNotification(
        artisan_id,      // ✅ لصاحب المنتج
        'review',
        result.insertId, // رقم التقييم
        message
      );
    }

    res.status(201).json({ message: "The rating has been added successfully." });
  } catch (err) {
    console.error("❌ Error adding review:", err);
    res.status(500).json({ error: "Failed to add rating", details: err.message });
  }
};


exports.getReviewsByProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const reviews = await Review.getProductReviews(productId);
    res.json(reviews);
  } catch (err) {
    console.error("❌ Error fetching reviews:", err);
    res
      .status(500)
      .json({ error: "Failed to get reviews", details: err.message });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    const productId = req.params.id;
    const average = await Review.getAverageRating(productId);
    res.json(average);
  } catch (err) {
    console.error("❌ Error calculating average rating:", err);
    res
      .status(500)
      .json({
        error: "Failed to calculate average rating",
        details: err.message,
      });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.getAllReviews();
    res.json(reviews);
  } catch (err) {
    console.error("❌ Error fetching all reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);

    if (isNaN(reviewId)) {
      return res.status(400).json({ error: "Invalid review ID" });
    }

    const result = await Review.deleteReviewById(reviewId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({ message: "✅ Review deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting review:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
};

