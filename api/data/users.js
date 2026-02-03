/**
 * User Data Layer
 * 
 * This module manages user data and provides functions for user authentication
 * and user management. Currently uses in-memory storage (array) for simplicity.
 * 
 * IMPORTANT: In production, this should be replaced with a proper database
 * (e.g., PostgreSQL, MongoDB, MySQL) to persist data across server restarts.
 * 
 * Security:
 * - Passwords are NEVER stored in plain text
 * - Uses bcrypt for password hashing (industry standard, resistant to brute force)
 * - Salt rounds set to 10 (good balance between security and performance)
 */

// bcryptjs: Library for hashing and comparing passwords securely
// Uses bcrypt algorithm with salt to prevent rainbow table attacks
import bcrypt from 'bcryptjs';

/**
 * In-memory user storage
 * 
 * WARNING: This is for development/demo purposes only!
 * Data will be lost when the server restarts.
 * 
 * In production, replace this with a database connection.
 * Each user object contains:
 * - id: Unique identifier
 * - username: Login username (should be unique)
 * - passwordHash: Bcrypt hash of the password (NEVER the plain password)
 * - role: User role for authorization (e.g., 'admin', 'user')
 * - email: User's email address
 * - createdAt: ISO timestamp of when user was created
 */
const users = [
 {
    id: 1,
    username: 'emadomar',
    passwordHash: bcrypt.hashSync('123456', 10), // Hash '123456' with 10 salt rounds
    role: 'admin',
    email: 'emad@klenka.com',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    username: 'sohaybalaa',
    passwordHash: bcrypt.hashSync('123456', 10), // Hash '123456' with 10 salt rounds
    role: 'user',
    email: 'sohayb@klenka.com',
    createdAt: new Date().toISOString()
  }
];

/**
 * Find a user by their username
 * 
 * Used during login to look up the user attempting to authenticate.
 * 
 * @param {string} username - The username to search for
 * @returns {Object|undefined} User object if found, undefined if not found
 */
export function findUserByUsername(username) {
  return users.find(user => user.username === username);
}

/**
 * Find a user by their ID
 * 
 * Used when you have a user ID (e.g., from session) and need full user details.
 * 
 * @param {number} id - The user ID to search for
 * @returns {Object|undefined} User object if found, undefined if not found
 */
export function findUserById(id) {
  return users.find(user => user.id === id);
}

/**
 * Verify a plain text password against a bcrypt hash
 * 
 * This is used during login to check if the provided password matches
 * the stored hash. Bcrypt comparison is async because it's computationally
 * intensive (this is intentional to slow down brute force attacks).
 * 
 * @param {string} plainPassword - The plain text password from login form
 * @param {string} hashedPassword - The bcrypt hash stored in the database
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Get user data without sensitive fields
 * 
 * Removes the passwordHash before sending user data to the client.
 * SECURITY: Never send password hashes to the frontend!
 * 
 * Uses object destructuring to extract passwordHash and return everything else.
 * 
 * @param {Object} user - The full user object from database
 * @returns {Object|null} User object without passwordHash, or null if no user
 */
export function getUserSafeData(user) {
  if (!user) return null;
  // Destructure: extract passwordHash, put everything else in safeUser
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

/**
 * Add a new user to the system
 * 
 * Creates a new user with hashed password and adds them to the users array.
 * In production, this would insert into a database.
 * 
 * @param {Object} userData - New user data
 * @param {string} userData.username - Username for the new user
 * @param {string} userData.password - Plain text password (will be hashed)
 * @param {string} userData.role - User role (defaults to 'user' if not provided)
 * @param {string} userData.email - User's email address
 * @returns {Object} Safe user data (without passwordHash) for the new user
 */
export function addUser(userData) {
  const newUser = {
    id: users.length + 1,  // Simple ID generation (use UUID or DB auto-increment in production)
    username: userData.username,
    passwordHash: bcrypt.hashSync(userData.password, 10),  // Hash password with 10 salt rounds
    role: userData.role || 'user',  // Default to 'user' role if not specified
    email: userData.email,
    createdAt: new Date().toISOString()  // ISO 8601 timestamp
  };
  users.push(newUser);  // Add to in-memory array (would be DB insert in production)
  return getUserSafeData(newUser);  // Return safe data without passwordHash
}
