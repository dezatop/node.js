const {Schema, model} = require("mongoose")


const TokenSchema = new Schema({
    //Ссылаемся на модель юзера в первой строке ref
    user:{type: Schema.Types.ObjectId, ref: "User"},
    refreshToken:{type:String, required: true},
})


module.exports = model("Token", TokenSchema)