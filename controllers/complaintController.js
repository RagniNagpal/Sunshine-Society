const Complaint = require('../models/complaint');
const User = require('../models/user'); 
const { redisClient } = require('../config/redis'); 

const NOTIFICATION_CHANNEL = 'SOCIETY_UPDATES';

exports.create = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ msg: 'title & body required' });
    const userId = req.user && req.user.id;
    
    const comp = await Complaint.create({ title, body, createdBy: userId });
    const user = await User.findById(userId, 'name flatNo email'); 
    
    const newComplaintData = {
      id: comp._id,
      title: comp.title,
      body: comp.body,
      resident: `${user.name} (${user.flatNo || 'N/A'})`,
      status: comp.status,
      createdAt: comp.createdAt
    };

    if (redisClient.isOpen) {
      await redisClient.publish(NOTIFICATION_CHANNEL, JSON.stringify({
        type: 'NEW_COMPLAINT',
        payload: newComplaintData
      }));
    }
    res.status(201).json(newComplaintData);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.listAll = async (req, res) => {
  try {
    const list = await Complaint.find().populate('createdBy', 'name flatNo email').sort({ createdAt: -1 }).lean();
    const mapped = list.map(c => ({
      id: c._id, title: c.title, body: c.body,
      resident: c.createdBy ? `${c.createdBy.name} (${c.createdBy.flatNo || 'N/A'})` : 'Unknown',
      status: c.status, createdAt: c.createdAt
    }));
    res.json(mapped);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
};

exports.getMine = async (req, res) => {
  try {
    const list = await Complaint.find({ createdBy: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json(list.map(c => ({ id: c._id, title: c.title, body: c.body, status: c.status, createdAt: c.createdAt })));
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
};

exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Only admin can approve complaints' });
    }

    const c = await Complaint.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    ).populate('createdBy', 'name flatNo email');

    if (!c) return res.status(404).json({ msg: 'Complaint not found' });

    if (redisClient.isOpen) {
      await redisClient.publish(
        'SOCIETY_UPDATES',
        JSON.stringify({
          type: 'COMPLAINT_STATUS_UPDATE',
          payload: {
            id: c._id,
            status: c.status,
            userId: String(c.createdBy._id),
            title: c.title
          }
        })
      );
    }
    res.json({ msg: 'Approved', id: c._id, status: c.status });
  } catch (err) {
    console.error('Approve complaint err:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.complete = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Only admin can complete complaints' });
    }
    const { id } = req.params;

    const c = await Complaint.findByIdAndUpdate(
      id,
      { status: 'completed' },
      { new: true }
    ).populate('createdBy', 'name flatNo email');

    if (!c) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }

    if (redisClient.isOpen) {
      await redisClient.publish(
        NOTIFICATION_CHANNEL,
        JSON.stringify({
          type: 'COMPLAINT_STATUS_UPDATE',
          payload: {
            id: c._id,
            status: c.status,
            userId: String(c.createdBy._id),
            title: c.title
          }
        })
      );
    }

    return res.json({
      msg: 'Completed',
      id: c._id,
      status: c.status
    });
  } catch (err) {
    console.error('Complete complaint err:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body } = req.body;
    
    const c = await Complaint.findOneAndUpdate(
      { _id: id, createdBy: req.user.id }, 
      { title, body },
      { new: true }
    );

    if (!c) return res.status(404).json({ msg: 'Complaint not found or unauthorized' });

    if (redisClient.isOpen) {
      await redisClient.publish(NOTIFICATION_CHANNEL, JSON.stringify({
        type: 'UPDATE_COMPLAINT',
        payload: { id: c._id, title: c.title, body: c.body }
      }));
    }
    res.json({ msg: 'Updated successfully', data: c });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const query = req.user.role === 'admin' ? { _id: id } : { _id: id, createdBy: req.user.id };
    
    const c = await Complaint.findOneAndDelete(query);
    if (!c) return res.status(404).json({ msg: 'Complaint not found' });

    if (redisClient.isOpen) {
      await redisClient.publish(NOTIFICATION_CHANNEL, JSON.stringify({
        type: 'DELETE_COMPLAINT',
        payload: { id: id }
      }));
    }
    res.json({ msg: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};