import {DataTypes, Model, UUIDV4} from "sequelize";
import {default as sequelize} from './sequelize';

export class Order extends Model {
    public id!: number;
    public uuid!: string;
    public origin_latitude!: number;
    public origin_longitude!: number;
    public destination_latitude!: number;
    public destination_longitude!: number;
    public distance!: number;
    public status!: string;
    public assignee!: string;

    public created_at!: Date;
    public updated_at!: Date;
}

Order.init({
    id: {
        type: DataTypes.NUMBER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: 'binary(16)',
        allowNull: false,
        get() {
            const value: Buffer = this.getDataValue('uuid');
            return value ? value.toString('hex') : null;
        },
        set(value: string) {
            this.setDataValue('uuid', Buffer.from(value, 'hex') || null);
        }
    },
    origin_latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    origin_longitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    destination_latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    destination_longitude: {
        type: DataTypes.FLOAT,
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
