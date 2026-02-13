const User = require('../models/user');
const { redisClient } = require('../config/redis');

const NOTIFICATION_CHANNEL = 'SOCIETY_UPDATES';    

exports.listAllResidents = async (req, res) => {
    try { 
        const users = await User.find(
            { role: 'resident' },
            'name flatNo maintenanceStatus maintenancePaymentDate'
        ).sort({ flatNo: 1 }).lean();

        res.json(users);

    } catch (err) {
        console.error('List residents error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.updateMaintenanceStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Only admin can update maintenance status' });
        }

        const { userId } = req.params;
        const { newStatus } = req.body;

        if (!newStatus || (newStatus !== 'Paid' && newStatus !== 'Pending')) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const updateFields = { maintenanceStatus: newStatus };

        if (newStatus === 'Paid') {
            updateFields.maintenancePaymentDate = new Date();
        } else {
            updateFields.maintenancePaymentDate = null;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true, select: 'name flatNo maintenanceStatus maintenancePaymentDate' }
        ).lean();

        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (redisClient.isOpen) {
            await redisClient.publish(
                NOTIFICATION_CHANNEL,
                JSON.stringify({
                    type: 'MAINTENANCE_STATUS_UPDATE',
                    payload: {
                        userId: String(user._id),
                        name: user.name,
                        flatNo: user.flatNo,
                        status: user.maintenanceStatus,
                        paymentDate: user.maintenancePaymentDate
                    }
                })
            );
        }

        return res.json({
            id: user._id,
            name: user.name,
            flatNo: user.flatNo,
            maintenanceStatus: user.maintenanceStatus
        });

    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};