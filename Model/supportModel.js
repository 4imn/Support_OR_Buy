const db = require("../Config/db");

const createSupport = async (support) => {
  if (support.supporter_id === support.artisan_id) {
    throw new Error("❌ You can't support yourself");
  }

  const sql = `
    INSERT INTO supports (supporter_id, supporter_name, artisan_id, product_id, amount, message)
    VALUES (?, ?, ?, ?, ?, ?)`;

  const values = [
    support.supporter_id,
    support.supporter_name || "unknown",
    support.artisan_id,
    support.product_id || null,
    support.amount,
    support.message || null,
  ];

  const [result] = await db.execute(sql, values);
  return result;
};

const getAllSupports = async () => {
  const sql = `
    SELECT 
      s.support_id, s.amount, s.message, s.created_at,
      u1.username AS supporter_name,
      u2.username AS artisan_name,
      p.title AS product_title
    FROM supports s
    LEFT JOIN users u1 ON s.supporter_id = u1.user_id
    LEFT JOIN users u2 ON s.artisan_id = u2.user_id
    LEFT JOIN products p ON s.product_id = p.product_id
    ORDER BY s.created_at DESC
  `;

  const [rows] = await db.execute(sql);
  return rows;
};

module.exports = {
  createSupport,
  getAllSupports,
};
