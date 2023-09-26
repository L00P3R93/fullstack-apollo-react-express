const getMessageModel = (sequelize, DataTypes) => {
    const Message = sequelize.define('message', {
        text: {
            type: DataTypes.STRING
        },
    });

    Message.associate = models => {
        Message.belongsTo(models.User, {
            onDelete: 'CASCADE'
        });
    };

    return Message;
}

export default getMessageModel;