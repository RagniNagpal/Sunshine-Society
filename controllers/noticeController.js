const Notice = require('../models/notice');
const { redisClient } = require('../config/redis'); 

const NOTIFICATION_CHANNEL = 'SOCIETY_UPDATES';

exports.getAll = async (req, res) => {
  try {
    const list = await Notice.find().populate('author', 'name flatNo').sort({ createdAt: -1 }).lean();

    const mapped = list.map(n => ({
      id: n._id,
      title: n.title,
      body: n.body,
      authorId: n.author?._id,
      authorName: n.author ? n.author.name : 'Admin',
      createdAt: n.createdAt,
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Get notices err:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: 'Not authenticated - missing user in request' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Only admins can create notices' });
    }

    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ msg: 'title & body required' });

    const authorId = req.user.id;
    const notice = await Notice.create({ title, body, author: authorId });

    const populated = await Notice.findById(notice._id).populate('author', 'name flatNo').lean();
    
    const newNotice = {
        id: populated._id,
        title: populated.title,
        body: populated.body,
        authorId: populated.author?._id || authorId,
        authorName: populated.author ? populated.author.name : 'Admin',
        createdAt: populated.createdAt,
    };
    
    if (redisClient.isOpen) {
      const messagePayload = {
        type: 'NEW_NOTICE',
        payload: newNotice
      };
      await redisClient.publish(NOTIFICATION_CHANNEL, JSON.stringify(messagePayload));
      console.log('Notice published to Redis Pub/Sub');
    }

    return res.status(201).json(newNotice);
  } catch (err) {
    console.error('Notice create error:', err);
    return res.status(500).json({ msg: 'Server error while creating notice', err});
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ msg: 'Not authenticated' });
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Only admins can update notices' });

    const { id } = req.params;
    const { title, body } = req.body;
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ msg: 'Notice not found' });

    if (title) notice.title = title;
    if (body) notice.body = body;
    await notice.save();

    if (redisClient.isOpen) {
      await redisClient.publish(NOTIFICATION_CHANNEL, JSON.stringify({
        type: 'UPDATE_NOTICE',
        payload: { id: notice._id, title: notice.title, body: notice.body }
      }));
    }

    res.json({ msg: 'Updated', id: notice._id, title: notice.title, body: notice.body, updatedAt: notice.updatedAt });
  } catch (err) {
    console.error('Update notice err:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ msg: 'Not authenticated' });
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Only admins can delete notices' });

    const { id } = req.params;
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ msg: 'Notice not found' });

    await Notice.findByIdAndDelete(id);

    if (redisClient.isOpen) {
      await redisClient.publish(NOTIFICATION_CHANNEL, JSON.stringify({
        type: 'DELETE_NOTICE',
        payload: { id }
      }));
    }
    
    res.json({ msg: 'Deleted', id });
  } catch (err) {
    console.error('Delete notice err:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};