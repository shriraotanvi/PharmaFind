class Customer {
    static async getAll(pharmacyId) {
      const [rows] = await pool.query('SELECT * FROM customers WHERE pharmacy_id', [pharmacyId]);
      return rows;
    }
  
    static async create(customerData) {
      const { name, email, phone, address, medical_history, pharmacy_id } = customerData;
      const [result] = await pool.query(
        'INSERT INTO customers (name, email, phone, address, medical_history, pharmacy_id) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, phone, address, medical_history, pharmacy_id]
      );
      return result.insertId;
    }
  }
  
  module.exports = Customer;