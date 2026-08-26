const asyncHandler = require('../utils/asyncHandler');
const { isInMemory } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const Notification = require('../models/Notification');

const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  let list = [];
  if (isInMemory()) {
    list = await memoryStore.getCollection('notifications').find({ owner: String(userId) });
  } else {
    list = await Notification.find({ owner: userId }).sort({ createdAt: -1 }).limit(20);
  }

  // Provide initial mock notifications if list is empty for fresh install
  if (!list || list.length === 0) {
    list = [
      {
        _id: 'notif_1',
        type: 'success',
        title: 'Platform Engine Initialized',
        message: 'Socket.IO real-time event streaming ready. Multi-agent chain online.',
        read: false,
        createdAt: new Date(),
      },
    ];
  }

  res.status(200).json({
    success: true,
    count: list.length,
    data: list,
  });
});

module.exports = {
  getNotifications,
};
