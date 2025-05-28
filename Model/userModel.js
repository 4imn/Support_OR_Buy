const db = require("../Config/db");

const createUser = async (user) => {
  const sql = `
    INSERT INTO users 
    (username, email, password_hash, phone, address, profile_picture, bio, role_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    user.username,
    user.email,
    user.password_hash,
    user.phone || null,
    user.address || null,
    user.profile_picture || null,
    user.bio || null,
    user.role_id, // بدل user_type
  ];

  const [result] = await db.execute(sql, values);
  return result;
};

const findUserByEmail = async (email) => {
  const sql = `
    SELECT u.*, r.key AS role
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.email = ?
    LIMIT 1
  `;
  const [rows] = await db.execute(sql, [email]);
  return rows;
};

const getUserById = async (id) => {
  const sql = `
    SELECT user_id, username, email, phone, address, bio, profile_picture, role_id, created_at
    FROM users
    WHERE user_id = ?
  `;
  const [rows] = await db.execute(sql, [id]);
  return rows[0] || null;
};

const updateUserProfile = async (id, updatedData) => {
  const fields = [];
  const values = [];

  if (updatedData.username !== undefined) {
    fields.push("username = ?");
    values.push(updatedData.username);
  }
  if (updatedData.phone !== undefined) {
    fields.push("phone = ?");
    values.push(updatedData.phone);
  }
  if (updatedData.address !== undefined) {
    fields.push("address = ?");
    values.push(updatedData.address);
  }
  if (updatedData.bio !== undefined) {
    fields.push("bio = ?");
    values.push(updatedData.bio);
  }
  if (updatedData.profile_picture !== undefined) {
    fields.push("profile_picture = ?");
    values.push(updatedData.profile_picture);
  }

  // ضروري: ما تعمل UPDATE بدون أي حقول
  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id); // آخر شيء ID
  const sql = `UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`;
  await db.execute(sql, values);
};

// ✅ دالة جديدة لجلب صلاحيات المستخدم
const getUserPermissions = async (userId) => {
  const [rows] = await db.execute(
    `
    SELECT p.key
    FROM users u
    JOIN roles r ON u.role_id = r.id
    JOIN role_permission rp ON rp.role_id = r.id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE u.user_id = ?
  `,
    [userId]
  );

  return rows.map((row) => row.key); // ترجع مصفوفة: ['create_product', 'view_orders']
};

module.exports = {
  createUser,
  findUserByEmail,
  getUserById,
  updateUserProfile,
  getUserPermissions,
};
