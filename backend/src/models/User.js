/**
 * User Model - Manages user authentication and profile data
 * 
 * This model handles:
 * - User authentication with bcrypt password hashing
 * - Role-based access control (Global Admin, Security Lead, DevOps, Auditor, Viewer)
 * - User status tracking (Active, Pending, Inactive)
 * - Organization association for multi-tenant support
 * 
 * @module models/User
 * @requires mongoose
 * @requires bcryptjs
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema Definition
 * 
 * Fields:
 * - organization: Reference to Organization (multi-tenant support)
 * - name: User's full name
 * - email: Unique email identifier (used for login)
 * - password: Hashed password using bcryptjs
 * - role: User's access level (one of: Global Admin, Security Lead, DevOps, Auditor, Viewer)
 * - status: Current user status (Active, Pending, Inactive)
 * - avatar: URL or path to user's profile picture
 * - company: Company/department name
 * - lastLogin: Timestamp of last successful login
 * 
 * Indexes:
 * - email: Unique constraint for login authentication
 * - organization: For multi-tenant data isolation
 * 
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema({
    /** Reference to parent Organization for multi-tenant isolation */
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    /** User's full name */
    name: { type: String, required: true },
    /** Unique email - used as login identifier */
    email: { type: String, required: true, unique: true },
    /** Password stored as bcryptjs hash (never stored in plain text) */
    password: { type: String, required: true },
    /** User's permission level in the system */
    role: { type: String, default: 'Viewer', enum: ['Global Admin', 'Security Lead', 'DevOps', 'Auditor', 'Viewer'] },
    /** Current account status */
    status: { type: String, default: 'Active', enum: ['Active', 'Pending', 'Inactive'] },
    /** User profile picture URL/path */
    avatar: { type: String },
    /** Company or department name */
    company: { type: String },
    /** Timestamp of user's last successful login */
    lastLogin: { type: Date }
}, { timestamps: true });

/**
 * Pre-save Middleware: Auto-hash password before storing
 * 
 * Security Measure:
 * - Automatically encrypts password using bcryptjs when document is saved
 * - Uses salt rounds of 10 for OWASP compliance
 * - Skips hashing if password hasn't been modified (for updates)
 * - Prevents plain-text password storage in database
 * 
 * @async
 * @private
 */
// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance Method: Compare entered password with hashed password
 * 
 * Used during login authentication to verify user credentials.
 * Returns boolean indicating if passwords match.
 * 
 * @async
 * @method matchPassword
 * @param {string} enteredPassword - Plain text password entered by user during login
 * @returns {Promise<boolean>} True if password matches, false otherwise
 * @example
 * const user = await User.findById(userId);
 * const isPasswordCorrect = await user.matchPassword(userEnteredPassword);
 * if (isPasswordCorrect) { // Login successful
 */
// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
