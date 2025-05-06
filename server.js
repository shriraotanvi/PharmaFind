require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pharmafind'
});

app.get('/testdb', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.send(`Database connected! Result: ${rows[0].result}`);
  } catch (err) {
    res.status(500).send('Database connection failed: ' + err.message);
  }
});

app.post('/api/login', async (req, res) => {
  const { email, pharmId, password } = req.body;
  
  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? OR pharmId = ?', 
      [email || null, pharmId || null]
    );
    
    if (users.length === 0) return res.status(401).json({ error: 'User not found' });
    
    const user = users[0];
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return res.status(401).json({ error: 'Wrong password' });
    
    res.json({ user: { id: user.id, name: user.name, email: user.email, pharmId: user.pharmId } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, pharmId, password } = req.body;
  
  try {
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE email = ? OR pharmId = ?',
      [email, pharmId]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email or Pharmacy ID already in use' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      'INSERT INTO users (name, email, pharmId, password) VALUES (?, ?, ?, ?)',
      [name, email, pharmId, hashedPassword]
    );
    
    res.status(201).json({ user: { id: result.insertId, name, email, pharmId } });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/customers', async (req, res) => {
  const { name, email, phone, address, medicalHistory, pharmacy_id } = req.body;

  if (!pharmacy_id) {
    return res.status(400).json({ error: 'pharmacy_id is required' });
  }
  
  try {
    const [result] = await db.query(
      `INSERT INTO customers 
       (name, email, phone, address, medical_history, pharmacy_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone, address, medicalHistory, pharmacy_id]
    );
    res.status(201).json({ id: result.insertId, message: 'Customer added successfully' });
  } catch (err) {
    console.error("Add customer error:", err);
    res.status(500).json({ error: 'Customer registration failed' });
  }
});

app.get('/api/customers', async (req, res) => {
  const { pharmacy_id } = req.query;

  if (!pharmacy_id) {
    const [customers] = await db.query(
      'SELECT * FROM customers WHERE pharmacy_id = 1',
    );
    res.json(customers);
  }

  try {
    const [customers] = await db.query(
      'SELECT * FROM customers WHERE pharmacy_id = ?',
      [pharmacy_id]
    );
    res.json(customers);
  } catch (err) {
    console.error("Get customers error:", err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.post('/api/medicines', async (req, res) => {
  const { name, description, dosage, manufacturer, price, quantity, pharmacy_id } = req.body;

  if (!pharmacy_id) {
    return res.status(400).json({ error: 'pharmacy_id is required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO medicines 
       (name, description, dosage, manufacturer, price, quantity, pharmacy_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, dosage, manufacturer, price, quantity, pharmacy_id]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("Add medicine error:", err);
    res.status(500).json({ error: 'Failed to add medicine' });
  }
});

app.get('/api/user' , async(req,res)=>{
  try{
    const[loguser]=await db.query(
      'SELECT * FROM pharmafind.users WHERE id=1',
    );
    res.json(loguser);
  }catch(err){
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/api/medicines', async (req, res) => {
  const { pharmacy_id } = req.query;

  if (!pharmacy_id) {
    const [medicines] = await db.query(
      'SELECT * FROM medicines WHERE pharmacy_id = 1',
    );
    res.json(medicines);
  }

  try {
    const [medicines] = await db.query(
      'SELECT * FROM medicines WHERE pharmacy_id = ?',
      [pharmacy_id]
    );
    res.json(medicines);
  } catch (err) {
    console.error("Get medicines error:", err);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

app.put('/api/medicines/:id', async (req, res) => {
  const { quantity, pharmacy_id } = req.body;
  const medicineId = req.params.id;

  if (!pharmacy_id) {
    return res.status(400).json({ error: 'pharmacy_id is required' });
  }
  if (quantity === undefined) {
    return res.status(400).json({ error: 'quantity is required' });
  }
  
  try {
    const [result] = await db.query(
      'UPDATE medicines SET quantity = ? WHERE id = ? AND pharmacy_id = ?',
      [quantity, medicineId, pharmacy_id]
    );
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Medicine not found or not associated with this pharmacy_id' });
    }
    res.json({ success: true, message: 'Medicine updated successfully' });
  } catch (err) {
    console.error("Update medicine error:", err);
    res.status(500).json({ error: 'Failed to update medicine' });
  }
});

app.delete('/api/medicines/:id', async (req, res) => {
  const { pharmacy_id } = req.query;
  const medicineId = req.params.id;

  if (!pharmacy_id) {
    return res.status(400).json({ error: 'pharmacy_id query parameter is required' });
  }
  
  try {
    const [result] = await db.query(
      'DELETE FROM medicines WHERE id = ? AND pharmacy_id = ?',
      [medicineId, pharmacy_id]
    );
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Medicine not found or not associated with this pharmacy_id' });
    }
    res.json({ success: true, message: 'Medicine deleted successfully' });
  } catch (err) {
    console.error("Delete medicine error:", err);
    res.status(500).json({ error: 'Failed to delete medicine' });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  const { pharmacy_id } = req.query;
  const customerId = req.params.id;

  if (!pharmacy_id) {
    return res.status(400).json({ error: 'pharmacy_id query parameter is required' });
  }
  
  try {
    const [customers] = await db.query(
      'SELECT * FROM customers WHERE id = ? AND pharmacy_id = ?',
      [customerId, pharmacy_id]
    );
    
    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found or not associated with this pharmacy_id' });
    }
    
    res.json(customers[0]);
  } catch (err) {
    console.error("Get specific customer error:", err);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});