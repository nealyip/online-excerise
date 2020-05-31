import {DataTypes, Model, UUIDV4} from "sequelize";
import {default as sequelize} from './sequelize';

export class OrderHistory extends Model {
    public id!: number;
    public order_id!: number;
    public status!: string;
    public assignee!: string;

    public created_at!: Date;
    public updated_at!: Date;
}

OrderHistory.init({
    id: {
        type: DataTypes.NUMBER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.NUMBER.UNSIGNED,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    assignee: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.TIME,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.TIME,
        allowNull: false
    },
}, {
    tableName: 'order_histories',
    sequelize,
    timestamps: false,
});
