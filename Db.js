"use strict";
exports.__esModule = true;
var cors = require("cors");
var express = require("express");
var mongodb_1 = require("mongodb");
var Db = /** @class */ (function () {
    function Db() {
        var _this = this;
        this.loadPLayer = function (req, res) {
            _this["try"](_this.players
                .findOne({ _id: _this.toInt(req.params._id) })
                .then(function (data) { return res.json(data); }));
        };
        this.deletePlayer = function (req, res) {
            _this["try"](_this.players
                .deleteOne({ _id: _this.toInt(req.params._id) })
                .then(res.send('Deleted.')));
        };
        this["try"](mongodb_1.MongoClient
            .connect('mongodb+srv://admin:m372fvzZde3z2Hk@tictactoe-yq7zv.mongodb.net/test?retryWrites=true&w=majority', { useUnifiedTopology: true })
            .then(function (client) {
            _this.players = client.db('tictactoe').collection('players');
            console.log('Connected to DB.');
            _this.startServices();
        }));
    }
    Db.prototype.startServices = function () {
        var app = express();
        app.use(cors());
        [
            {
                params: '/loadPlayer/:_id',
                action: this.loadPLayer
            },
            {
                params: '/savePlayer/:_id/:name/:points',
                action: this.savePlayer
            },
            {
                params: '/deletePlayer/:_id',
                action: this.deletePlayer
            }
        ].forEach(function (_a) {
            var params = _a.params, action = _a.action;
            return app.get(params, action);
        });
        app.listen(8000);
        console.log('Services started.');
    };
    Db.prototype.savePlayer = function (req, res) {
        var _a = req.params, _id = _a._id, name = _a.name, points = _a.points;
        _id = this.toInt(_id);
        this.players
            .updateOne({ _id: _id }, { $set: { name: name, points: points } })
            .then(res.send('Updated.'))["catch"](this["try"](this.players
            .insertOne({ _id: _id, name: name, points: points })
            .then(res.send('Saved.'))));
    };
    Db.prototype.toInt = function (value) {
        return parseInt(value, 10);
    };
    Db.prototype["try"] = function (promise) {
        promise["catch"](function (error) { return console.log(error); });
    };
    return Db;
}());
new Db();
