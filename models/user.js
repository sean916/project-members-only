var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        username: { type: String, required: true },
        password: { type: String, required: true },
        member_status: { type: Boolean, required: true, default: false },
        admin_status: { type: Boolean, default: false }
    }
);

UserSchema
.virtual('url')
.get(function() {
    return '/catalog/user/' + this._id;
});

// Export model
module.exports = mongoose.model('User', UserSchema);