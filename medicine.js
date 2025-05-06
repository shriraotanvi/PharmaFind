class Medicine {
    static async getAll(pharmacyId) {
      const [rows] = await pool.query('SELECT * FROM medicines WHERE pharmacy_id = ?', [pharmacyId]);
      return rows;
    }
  
    static async create(medicineData) {
      const { name, description, dosage, manufacturer, price, quantity, pharmacy_id } = medicineData;
      const [result] = await pool.query(
        'INSERT INTO medicines (name, description, dosage, manufacturer, price, quantity, pharmacy_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, description, dosage, manufacturer, price, quantity, pharmacy_id]
      );
      return result.insertId;
    }
  }
  
  module.exports = Medicine;