const admin = require('firebase-admin');

let serviceAccount = null;
const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;

if (serviceAccountStr) {
    try {
        // Handle potential string escaping or base64 (if user chooses to use it)
        let processedStr = serviceAccountStr;

        // Basic check if it looks like a JSON but might be malformed
        if (!processedStr.trim().startsWith('{')) {
            // It might be base64 encoded to avoid escaping issues in Vercel
            try {
                const decoded = Buffer.from(processedStr, 'base64').toString('utf8');
                if (decoded.trim().startsWith('{')) {
                    processedStr = decoded;
                }
            } catch (e) {
                // Not base64, continue with original
            }
        }

        serviceAccount = JSON.parse(processedStr);

        // Ensure the private key is properly formatted
        if (serviceAccount.private_key && serviceAccount.private_key.includes('\\n')) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        console.log('Firebase Service Account parsed successfully for project:', serviceAccount.project_id);
    } catch (error) {
        console.error('ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON.');
        console.error('Check if the JSON is correctly formatted in your environment variables.');
        console.error('Position of error:', error.message);
        // Log a small sanitized snippet of the string to help debugging format issues
        if (serviceAccountStr.length > 20) {
            console.error('String starts with:', serviceAccountStr.substring(0, 15) + '...');
        }
    }
} else {
    console.warn('CRITICAL: FIREBASE_SERVICE_ACCOUNT environment variable is missing');
}

if (serviceAccount && !admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin Initialized Successfully');
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

const db = admin.apps.length ? admin.firestore() : null;
const auth = admin.apps.length ? admin.auth() : null;

if (!db) console.error('Firestore initialization failed - db is null');
if (!auth) console.error('Firebase Auth initialization failed - auth is null');

module.exports = { admin, db, auth };
