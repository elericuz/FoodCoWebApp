const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    code: {
        type: Number,
        required: true,
        default: 0
    },
    spanish_name: {
        type: String
    },
    provider: {
        type: String
    },
    inactive: {
        type: Boolean,
        required: true,
        default: false
    },
    exclusive_item: {
        type: Boolean,
        required: true,
        default: false
    },
    catch_wt_sgl: {
        type: Boolean,
        required: true,
        default: false
    },
    catch_wt_mutli: {
        type: Boolean,
        required: true,
        default: false
    },
    par_item: {
        type: Boolean,
        required: true,
        default: false
    },
    adv_purchase: {
        type: Boolean,
        required: true,
        default: false
    },
    adv_purchase_days: {
        type: Number,
        required: false,
        default: 0
    },
    expense: {
        type: Boolean,
        required: true,
        default: false
    },
    misc_item: {
        type: Boolean,
        required: true,
        default: false
    },
    non_stock: {
        type: Boolean,
        required: true,
        default: false
    },
    prepack_item: {
        type: Boolean,
        required: true,
        default: false
    },
    supply: {
        type: Boolean,
        required: true,
        default: false
    },
    web_exclude: {
        type: Boolean,
        required: true,
        default: false
    },
    two_specian_inv: {
        type: Boolean,
        required: true,
        default: false
    },
    non_produce: {
        type: Boolean,
        required: true,
        default: false
    },
    non_domestic: {
        type: Boolean,
        required: true,
        default: false
    },
    organic: {
        type: Boolean,
        required: true,
        default: false
    },
    pesticide_free: {
        type: Boolean,
        required: true,
        default: false
    },
    pallet_tags: {
        type: Boolean,
        required: true,
        default: false
    },
    taxable: {
        type: Boolean,
        required: true,
        default: false
    },
    quality_check: {
        type: Boolean,
        required: true,
        default: false
    },
    future_buying_guide: {
        type: Boolean,
        required: true,
        default: false
    },
    daily_buying_guide: {
        type: Boolean,
        required: true,
        default: false
    },
    non_commission: {
        type: Boolean,
        required: true,
        default: false
    },
    totes: {
        type: Boolean,
        required: true,
        default: false
    },
    driver_load: {
        type: Boolean,
        required: true,
        default: false
    },
    manufacturer_id: {
        type: String
    },
    manufacturer_name: {
        type: String
    },
    manufacturer_part_number: {
        type: String
    },
    manufacturer_brand_name: {
        type: String
    },
    upc: {
        type: String
    },
    warning: {
        type: Boolean,
        required: true,
        default: false
    },
    warning_text: {
        type: String
    },
    pack_size: {
        type: String
    },
    pallet: {
        type: Number
    },
    gross_lbs: {
        type: Number
    },
    net_lbs: {
        type: Number
    },
    equiv: {
        type: Number
    },
    cube: {
        type: Number
    },
    expire_item: {
        type: Boolean,
        required: true,
        default: false
    },
    shelf_life: {
        type: Number
    },
    max_temp: {
        type: Number
    },
    tie: {
        type: Number
    },
    high: {
        type: Number
    },
    cool: {
        type: String
    },
    sales: {
        type: String
    },
    cogs: {
        type: String
    },
    invt: {
        type: String
    },
    buyer: {
        type: String
    },
    misc: {
        type: String
    },
    group: {
        type: String
    },
    class: {
        type: String
    },
    misc_one: {
        type: String
    },
    misc_two: {
        type: String
    },
    other_pick: {
        type: String
    },
    max_label_weight: {
        type: Number
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    price: {
        type: "Number",
        required: false,
        default: 0
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Products', productSchema);
module.exports = Product;