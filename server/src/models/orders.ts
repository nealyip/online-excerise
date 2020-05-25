import {DataTypes, Model} from "sequelize";
import {default as sequelize} from './sequelize';

export class Order extends Model {
    public id!: string;
    public origin_latitude!: string;
    public origin_longitude!: string;
    public destination_latitude!: string;
    public destination_longitude!: string;
    public distance!: number;
    public status!: string;
    public assignee!: string;

    public created_at!: string;
    public updated_at!: string;
}

Order.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    origin_latitude: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    origin_longitude: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    destination_latitude: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    destination_longitude: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    distance: {
        type: DataTypes.NUMBER,
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
    tableName: 'orders',
    sequelize,
    timestamps: false,
});
