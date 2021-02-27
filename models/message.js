const { DateTime } = require('luxon');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MessageSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: {type: String, required: true},
        body: {type: String, required: true},
        timestamp: { type: Date, default: Date.now() }
    }
);

MessageSchema
.virtual('timestamp_view_format')
.get(function () {
    return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATETIME_HUGE);
});

MessageSchema
.virtual('url')
.get(function () {
    return '/catalog/message/' + this._id;
});

// Export model
module.exports = mongoose.model('Message', MessageSchema);