const pool = require('../config/db');

exports.getAllWorkers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM workers');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching workers:', error);
        res.status(500).json({ message: 'Server error while fetching workers' });
    }
};

exports.getWorkerProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM workers WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Worker not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching worker:', error);
        res.status(500).json({ message: 'Server error fetching worker profile' });
    }
};

exports.updateWorker = async (req, res) => {
    const { id } = req.params;
    const { name, email, position, area } = req.body;
    try {
        const result = await pool.query(
            "UPDATE workers SET name = $1, email = $2, position = $3, area = $4, updated_at = NOW() WHERE id = $5 RETURNING *",
            [name, email, position, area, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Worker not found' });
        }
        res.json({ success: true, worker: result.rows[0] });
    } catch (error) {
        console.error('Error updating worker:', error);
        res.status(500).json({ message: 'Server error while updating worker' });
    }
};

exports.deleteWorker = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM workers WHERE id = $1 RETURNING *", 
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Worker not found' });
        }
        res.json({ success: true, worker: result.rows[0] });
    } catch (error) {
        console.error('Error deleting worker:', error);
        res.status(500).json({ message: 'Server error while deleting worker' });
    }
};