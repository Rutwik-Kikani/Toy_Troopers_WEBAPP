const { db } = require("../config/firebase");


//it will take string array of the userIds
const getUserNamesByIds = async (userIds) => {
    const uniqueUserIds = [...new Set(userIds)];
    const userNames = {};

    for (const userId of uniqueUserIds) {
        const userSnapshot = await db.ref(`users/${userId}`).once('value');
        const userData = userSnapshot.val();
        userNames[userId] = userData ? userData.username : 'Unknown User';
    }

    return userNames;
};

module.exports = { getUserNamesByIds };