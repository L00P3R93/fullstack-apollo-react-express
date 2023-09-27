const getMessageModel = (sequelize, { DataTypes }) => {
    const Message = sequelize.define('message', {
        text: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'A message has to have text'
                }
            }
        },
    });

    Message.associate = (models) => {
        Message.belongsTo(models.User, { onDelete: 'CASCADE' });
    };

    return Message;
}

export default getMessageModel;