const express = require("express");
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ресторан",
  password: "1234",
  port: 5432,
});

const app = express();

app.use(express.json());

//GET запрос для главной страницы
app.get("/", (req, res) => {
  res.send("Привет! Это главная страница вашего приложения.");
});

app.get("/users", async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM user_data");
    res.json(users.rows);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Получение пользователя по ID
app.get("/users/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await pool.query(
      "SELECT * FROM user_data WHERE user_id = $1",
      [user_id]
    );
    if (user.rows.length > 0) {
      res.json(user.rows[0]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Создание нового пользователя
app.post("/users", async (req, res) => {
  try {
    const {
      user_login,
      user_password,
      user_phone,
      user_email,
      user_full_name,
      user_bank_details,
    } = req.body;
    const newUser = await pool.query(
      "INSERT INTO user_data (user_login, user_password, user_phone, user_email, user_full_name, user_bank_details) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        user_login,
        user_password,
        user_phone,
        user_email,
        user_full_name,
        user_bank_details,
      ]
    );
    res.json(newUser.rows[0]);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Удаление пользователя
app.delete("/users/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    await pool.query("DELETE FROM user_data WHERE user_id = $1", [user_id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Получение всех заказов
app.get("/orders", async (req, res) => {
  try {
    const orders = await pool.query('SELECT * FROM "order"');
    res.json(orders.rows);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Создание нового заказа
app.post("/orders", async (req, res) => {
  try {
    const { user_id, user_bill_id, order_sum, payment_id, ordered_in } =
      req.body;
    const newOrder = await pool.query(
      'INSERT INTO "order" (user_id, user_bill_id, order_sum, payment_id, ordered_in) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, user_bill_id, order_sum, payment_id, ordered_in]
    );
    res.json(newOrder.rows[0]);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.get("/menu", async (req, res) => {
  try {
    const menuItems = await pool.query("SELECT * FROM menu");
    res.json(menuItems.rows);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Создание нового блюда в меню
app.post("/menu", async (req, res) => {
  try {
    const { dish_price, dish_name, recipe_id } = req.body;
    const newMenuItem = await pool.query(
      "INSERT INTO menu (dish_price, dish_name, recipe_id) VALUES ($1, $2, $3) RETURNING *",
      [dish_price, dish_name, recipe_id]
    );
    res.json(newMenuItem.rows[0]);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Получение отзывов
app.get("/reviews", async (req, res) => {
  try {
    const reviews = await pool.query("SELECT * FROM review");
    res.json(reviews.rows);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Создание нового отзыва
app.post("/reviews", async (req, res) => {
  try {
    const { user_id, mark, comment } = req.body;
    const newReview = await pool.query(
      "INSERT INTO review (user_id, mark, comment) VALUES ($1, $2, $3) RETURNING *",
      [user_id, mark, comment]
    );
    res.json(newReview.rows[0]);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.put("/menu/:dish_id", async (req, res) => {
  try {
    const { dish_id } = req.params;
    const { dish_price, dish_name, recipe_id } = req.body;
    const updatedMenuItem = await pool.query(
      "UPDATE menu SET dish_price = $1, dish_name = $2, recipe_id = $3 WHERE dish_id = $4 RETURNING *",
      [dish_price, dish_name, recipe_id, dish_id]
    );
    if (updatedMenuItem.rows.length > 0) {
      res.json(updatedMenuItem.rows[0]);
    } else {
      res.status(404).json({ error: "Menu item not found" });
    }
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Удаление блюда из меню
app.delete("/menu/:dish_id", async (req, res) => {
  try {
    const { dish_id } = req.params;
    await pool.query("DELETE FROM menu WHERE dish_id = $1", [dish_id]);
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Обновление отзыва
app.put("/reviews/:review_id", async (req, res) => {
  try {
    const { review_id } = req.params;
    const { user_id, mark, comment } = req.body;
    const updatedReview = await pool.query(
      "UPDATE review SET user_id = $1, mark = $2, comment = $3 WHERE review_id = $4 RETURNING *",
      [user_id, mark, comment, review_id]
    );
    if (updatedReview.rows.length > 0) {
      res.json(updatedReview.rows[0]);
    } else {
      res.status(404).json({ error: "Review not found" });
    }
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Удаление отзыва
app.delete("/reviews/:review_id", async (req, res) => {
  try {
    const { review_id } = req.params;
    await pool.query("DELETE FROM review WHERE review_id = $1", [review_id]);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Обновление информации о счете пользователя
app.put("/user_bills/:bill_id", async (req, res) => {
  try {
    const { bill_id } = req.params;
    const { user_id, amount_due, due_date, payment_status } = req.body;
    const updatedUserBill = await pool.query(
      "UPDATE user_bill SET user_id = $1, amount_due = $2, due_date = $3, payment_status = $4 WHERE bill_id = $5 RETURNING *",
      [user_id, amount_due, due_date, payment_status, bill_id]
    );
    if (updatedUserBill.rows.length > 0) {
      res.json(updatedUserBill.rows[0]);
    } else {
      res.status(404).json({ error: "User bill not found" });
    }
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Удаление счета пользователя
app.delete("/user_bills/:bill_id", async (req, res) => {
  try {
    const { bill_id } = req.params;
    await pool.query("DELETE FROM user_bill WHERE bill_id = $1", [bill_id]);
    res.json({ message: "User bill deleted successfully" });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Обновление информации о платеже
app.put("/payments/:payment_id", async (req, res) => {
  try {
    const { payment_id } = req.params;
    const { user_id, amount, payment_date, payment_method } = req.body;
    const updatedPayment = await pool.query(
      "UPDATE payment SET user_id = $1, amount = $2, payment_date = $3, payment_method = $4 WHERE payment_id = $5 RETURNING *",
      [user_id, amount, payment_date, payment_method, payment_id]
    );
    if (updatedPayment.rows.length > 0) {
      res.json(updatedPayment.rows[0]);
    } else {
      res.status(404).json({ error: "Payment not found" });
    }
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Удаление информации о платеже
app.delete("/payments/:payment_id", async (req, res) => {
  try {
    const { payment_id } = req.params;
    await pool.query("DELETE FROM payment WHERE payment_id = $1", [payment_id]);
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.put("/dish_recipes/:recipe_id", async (req, res) => {
  try {
    const { recipe_id } = req.params;
    const { dish_id, recipe_description, chef_id } = req.body;
    const updatedRecipe = await pool.query(
      "UPDATE dish_recipe SET dish_id = $1, recipe_description = $2, chef_id = $3 WHERE recipe_id = $4 RETURNING *",
      [dish_id, recipe_description, chef_id, recipe_id]
    );
    if (updatedRecipe.rows.length > 0) {
      res.json(updatedRecipe.rows[0]);
    } else {
      res.status(404).json({ error: "Dish recipe not found" });
    }
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Удаление рецепта блюда
app.delete("/dish_recipes/:recipe_id", async (req, res) => {
  try {
    const { recipe_id } = req.params;
    await pool.query("DELETE FROM dish_recipe WHERE recipe_id = $1", [
      recipe_id,
    ]);
    res.json({ message: "Dish recipe deleted successfully" });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
