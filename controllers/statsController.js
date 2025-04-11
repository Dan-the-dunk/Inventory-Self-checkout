// backend/controllers/statsController.js
const pool = require('../config/db');

exports.getStatistics = async (req, res) => {
    try {
        const { timeframe } = req.query; // Expected: week, month, year

        let query = "";
        let groupBy = "";

        // Determine the grouping based on the timeframe query parameter
        switch (timeframe?.toLowerCase()) { // Use optional chaining and lowercase for robustness
            case "week":
                groupBy = "DATE_TRUNC('week', extracted_at)";
                break;
            case "month":
                groupBy = "DATE_TRUNC('month', extracted_at)";
                break;
            case "year":
                groupBy = "DATE_TRUNC('year', extracted_at)";
                break;
            default:
                // Return an error if the timeframe is missing or invalid
                return res.status(400).json({ message: "Invalid or missing timeframe parameter. Use 'week', 'month', or 'year'." });
        }

        // Construct the SQL query
        // Ensure the 'extracted_at' column exists and is indexed in your 'warehouse_log' table for better performance.
        query = `
            SELECT 
                ${groupBy} AS period, 
                COUNT(*) as total_items 
            FROM 
                warehouse_log 
            WHERE 
                extracted_at IS NOT NULL -- Optional: filter out null dates if necessary
            GROUP BY 
                period 
            ORDER BY 
                period DESC;
        `;

        const result = await pool.query(query);
        res.status(200).json(result.rows); // Send 200 OK with the data

    } catch (error) {
        console.error("Error fetching statistics:", error);

        // Check for specific database errors, like a missing table
        if (error.code === '42P01') { // 'undefined_table' error code in PostgreSQL
            return res.status(500).json({ message: "Statistics data source (warehouse_log table) not found." });
        }

        // General server error fallback
        res.status(500).json({ message: "Server error while fetching statistics" });
    }
};