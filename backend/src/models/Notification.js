/**
 * Notification Model - In-app notification system for alerts and updates
 * 
 * This model handles:
 * - Real-time notifications for security events, policy changes, and system alerts
 * - Read/unread tracking for user notification center
 * - Priority-based notification routing and display
 * - Organization-wide notification management
 * 
 * Notification Types:
 * - Security: CORS blocks, suspicious origins, failed authentications
 * - Policy: Policy updates, new policies, policy removals
 * - Alert: System maintenance, feature updates, important notices
 * - System: General informational messages
 * 
 * Use Cases:
 * - Alert users to blocked suspicious requests
 * - Notify when CORS policies are updated
 * - Inform about system maintenance or updates
 * - Track user engagement via read status
 * 
 * @module models/Notification
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * Notification Schema Definition
 * 
 * Fields:
 * - organization: Organization this notification belongs to
 * - type: Category of notification (security, policy, alert, system)
 * - title: Short headline/subject of the notification
 * - message: Detailed notification content
 * - read: Whether user has read this notification
 * - priority: Urgency level (Low, Medium, High)
 * - createdAt: When notification was created
 * - updatedAt: When notification was last modified
 * 
 * Notification Priority Levels:
 * - Low: Informational (e.g., "New feature available")
 * - Medium: Important (e.g., "Policy updated for partner API")
 * - High: Critical (e.g., "Multiple blocked requests from suspicious origin")
 * 
 * @type {mongoose.Schema}
 */
const notificationSchema = new mongoose.Schema({
    /** Organization to which this notification is sent */
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    /** Category of notification for filtering and routing */
    type: { type: String, enum: ['security', 'policy', 'alert', 'system'], default: 'system' },
    /** Short headline/subject line of the notification */
    title: { type: String, required: true },
    /** Detailed message content of the notification */
    message: { type: String, required: true },
    /** Whether the user has read this notification */
    read: { type: Boolean, default: false },
    /** Urgency level for display and alert prioritization */
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
