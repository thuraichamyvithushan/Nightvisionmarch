const { db } = require('../config/firebase');
const { sendEmail } = require('../services/emailService');
const crypto = require('crypto');
const path = require('path');

const COLLECTION_NAME = 'purchaseRequests';

exports.createPurchaseRequest = async (req, res) => {
    try {
        const {
            employeeName, phoneNumber, publicEmail,
            serialNumber, shopName, marketingInterest,
            experience
        } = req.body;

        const files = req.files;
        let receiptUrl = '';
        let boxPhotoUrl = '';

        const apiKey = process.env.IMGBB_API_KEY;
        if (!apiKey) throw new Error('IMGBB_API_KEY not configured in .env');

        const uploadToImgBB = async (fileBuffer) => {
            const base64Image = fileBuffer.toString('base64');
            const formData = new URLSearchParams();
            formData.append('image', base64Image);

            const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const imgbbData = await imgbbResponse.json();
            if (imgbbData.success) {
                return imgbbData.data.url;
            } else {
                console.error('ImgBB Upload Error:', imgbbData);
                throw new Error('Failed to upload image to ImgBB');
            }
        };

        if (files && files.receipt) {
            receiptUrl = await uploadToImgBB(files.receipt[0].buffer);
        }

        if (files && files.boxPhoto) {
            boxPhotoUrl = await uploadToImgBB(files.boxPhoto[0].buffer);
        }

        const adminEmail = req.user?.email || process.env.ADMIN_EMAIL || 'admin@huntsmanoptics.com';
        const adminName = req.user?.name || 'Staff Member';

        const newRequest = {
            employeeName,
            phoneNumber,
            publicEmail,
            serialNumber,
            shopName,
            marketingInterest,
            experience: experience || '',
            adminEmail,
            adminName,
            receiptUrl,
            boxPhotoUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const docRef = await db.collection(COLLECTION_NAME).add(newRequest);
        const requestData = { id: docRef.id, ...newRequest };

        // Send notification to admin if exists
        const targetAdminEmail = process.env.ADMIN_EMAIL;
        if (targetAdminEmail) {
            await sendEmail(targetAdminEmail, 'newSubmissionNotification', {
                request: requestData
            });
        }

        res.status(201).json({ message: 'Receipt Submission successful', id: docRef.id });

    } catch (error) {
        console.error('Error creating purchase request:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getPurchaseRequests = async (req, res) => {
    try {
        const { status, store, employee, startDate, endDate } = req.query;
        let query = db.collection(COLLECTION_NAME);

        if (status) query = query.where('status', '==', status);


        const snapshot = await query.get();
        let requests = [];

        snapshot.forEach(doc => {
            requests.push({ id: doc.id, ...doc.data() });
        });

        if (store) {
            requests = requests.filter(r => (r.shopName || '').toLowerCase().includes(store.toLowerCase()));
        }
        if (employee) {
            requests = requests.filter(r => r.employeeName.toLowerCase().includes(employee.toLowerCase()));
        }
        if (startDate) {
            requests = requests.filter(r => new Date(r.createdAt) >= new Date(startDate));
        }
        if (endDate) {
            requests = requests.filter(r => new Date(r.createdAt) <= new Date(endDate));
        }

        requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPurchaseRequestById = async (req, res) => {
    try {
        const doc = await db.collection(COLLECTION_NAME).doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ error: 'Request not found' });
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updatePurchaseRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body, updatedAt: new Date().toISOString() };

        // Remove fields that shouldn't be updated manually if necessary
        delete updates.id;
        delete updates.createdAt;

        await db.collection(COLLECTION_NAME).doc(id).update(updates);
        res.json({ message: 'Request updated successfully' });
    } catch (error) {
        console.error('Error updating purchase request:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.deletePurchaseRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Request not found' });
        }

        await docRef.delete();
        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

