const pool = require('../config/db');

exports.getStatistics = async (req, res) => {
    try {
        const { timeframe, status } = req.query; // timeframe: daily, week, month, year; status: passed or failed

        if (!timeframe) {
            return res.status(400).json({ message: "Missing timeframe parameter. Use 'daily', 'week', 'month', or 'year'." });
        }
        if (status !== 'passed' && status !== 'failed') {
            return res.status(400).json({ message: "Invalid or missing status parameter. Use 'passed' or 'failed'." });
        }

        let groupBy, dateFormat;
        switch (timeframe.toLowerCase()) { 
            case "daily":
                groupBy = "DATE_TRUNC('day', start_time)";
                dateFormat = "YYYY-MM-DD";
                break;
            case "week":
                // For a week, group by day for more granularity
                groupBy = "DATE_TRUNC('day', start_time)";
                dateFormat = "YYYY-MM-DD";
                break;
            case "month":
                // For a month, group by week (ISO week format)
                groupBy = "DATE_TRUNC('week', start_time)";
                dateFormat = "IYYY-IW";
                break;
            case "year":
                // For a year, group by month
                groupBy = "DATE_TRUNC('month', start_time)";
                dateFormat = "YYYY-MM";
                break;
            default:
                return res.status(400).json({ message: "Invalid timeframe parameter. Use 'daily', 'week', 'month', or 'year'." });
        }

        const query = `
            SELECT 
                to_char(${groupBy}, '${dateFormat}') AS period,
                COUNT(*) AS total_items
            FROM 
                warehouse_stat
            WHERE 
                status = $1
            GROUP BY 
                period
            ORDER BY 
                period ASC;
        `;

        const result = await pool.query(query, [status]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching statistics:", error);
        res.status(500).json({ message: "Server error while fetching statistics" });
    }
};