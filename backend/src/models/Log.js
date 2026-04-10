/**
 * Log Model - Event logging for real-time monitoring and analytics
 * 
 * This model handles:
 * - Real-time CORS request logging (blocked, allowed, modified)
 * - Event tracking for policy violations and security incidents
 * - Severity classification for alerting and monitoring
 * - Analytics data for request patterns and trend analysis
 * 
 * Key Features:
 * - Tracks CORS enforcement: which requests passed/blocked
 * - Severity levels for incident prioritization
 * - Rich metadata for troubleshooting and analysis
 * - Optimized indexes for time-series analytics
 * 
 * @module models/Log
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * Log Schema Definition
 * 
 * Fields:
 * - organization: Organization to which this log belongs
 * - timestamp: When the event occurred (indexed for time-series queries)
 * - eventType: Type of event (CORS Block, Policy Update, API Discovery)
 * - sourceIp: IP address of the request source
 * - origin: Origin header from the HTTP request
 * - apiEndpoint: Which API endpoint was accessed
 * - status: Outcome (Blocked, Allowed, Modified)
 * - severity: Impact level (Low, Medium, High, Critical)
 * - details: Additional context or error information
 * 
 * Analytics Use Cases:
 * - Dashboard: Request trends over time
 * - Reports: Blocked requests by origin
 * - Alerts: Critical severity events
 * - Debugging: IP-to-endpoint mapping
 * 
 * @type {mongoose.Schema}
 */
const logSchema = new mongoose.Schema({
    /** Organization to which this log entry belongs */
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: false, index: true },
    /** Timestamp when the event occurred (critical for time-series analytics) */
    timestamp: { type: Date, default: Date.now, index: true },
    /** Type of event (CORS Block, Policy Update, API Discovery, etc.) */
    eventType: { type: String, required: true }, // e.g., 'CORS Block', 'Policy Update', 'API Discovery'
    /** Source IP address of the requesting client */
    sourceIp: { type: String },
    /** Origin header from the HTTP request (what domain initiated the request) */
    origin: { type: String },
    /** API endpoint path that was accessed */
    apiEndpoint: { type: String },
    /** Outcome of CORS evaluation (Blocked, Allowed, Modified) */
    status: { type: String, enum: ['Blocked', 'Allowed', 'Modified'], default: 'Allowed' },
    /** Impact severity for alerting and prioritization */
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
    /** Additional context, error messages, or detailed information */
    details: { type: String }
}, { timestamps: true });

/**
 * Index: Compound index for analytics queries
 * 
 * Purpose: Optimize dashboard and analytics queries
 * - Supports: "Request count per organization per hour/day"
 * - Sorting by timestamp helps generate trend data
 * - Most common query: organization + time range
 */
// Compound index for analytics queries (e.g., Request count per org per day)
logSchema.index({ organization: 1, timestamp: -1 });

/**
 * Index: Filter by organization and status
 * 
 * Purpose: Quick lookup of specific event types
 * - Supports: "Show all blocked requests for org X"
 * - Helps identify security incidents (Blocked status)
 * - Useful for compliance reporting
 */
logSchema.index({ organization: 1, status: 1 });

module.exports = mongoose.model('Log', logSchema);
