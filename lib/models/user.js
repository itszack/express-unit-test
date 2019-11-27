var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    name: { type: String, required: "Name is required" },
    email: { type: String, required: "Email is required" },
    age: Number
}, {
    collection: "users"
}); //overrides default collection name auto created

module.exports = mongoose.model("User", UserSchema);
