"use strict";
exports.__esModule = true;
var cors = require("cors");
var express = require("express");
var mongodb_1 = require("mongodb");
var Db = /** @class */ (function () {
    function Db() {
        var _this = this;
        this.loadPLayer = function (req, res) {
            var _id = parseInt(req.params.id);
            _this["try"]({
                res: res,
                action: _this.players.findOne({ _id: _id }),
                onSuccess: function (result) { return res.json(result); }
            });
        };
        this.savePlayer = function (req, res) {
            var _id = parseInt(req.params.id);
            var _a = req.params, name = _a.name, points = _a.points;
            _this["try"]({
                res: res,
                action: _this.players.updateOne({ _id: _id }, { $set: { name: name, points: points } }),
                onSuccess: 
                // Maybe updateOne had no effect (matchedCount = 0), because there was no record found with this id.
                // In this case a new record has to be inserted.
                function (_a) {
                    var matchedCount = _a.matchedCount;
                    if (matchedCount === 0) {
                        _this["try"]({
                            res: res,
                            action: _this.players.insertOne({ _id: _id, name: name, points: points })
                        });
                    }
                    else {
                        res.sendStatus(200);
                    }
                }
            });
        };
        this.deletePlayer = function (req, res) {
            var _id = parseInt(req.params.id);
            _this["try"]({
                res: res,
                action: _this.players.deleteOne({ _id: _id })
            });
        };
        mongodb_1.MongoClient
            .connect('mongodb+srv://admin:m372fvzZde3z2Hk@tictactoe-yq7zv.mongodb.net/test?retryWrites=true&w=majority', { useUnifiedTopology: true })
            .then(function (client) {
            _this.players = client.db('tictactoe').collection('players');
            console.log('Connected to DB.');
            _this.startServices();
        })["catch"](this.printError);
    }
    Db.prototype.startServices = function () {
        var app = express();
        app.use(cors());
        [
            {
                url: '/loadPlayer/:id',
                action: this.loadPLayer
            },
            {
                url: '/savePlayer/:id/:name/:points',
                action: this.savePlayer
            },
            {
                url: '/deletePlayer/:id',
                action: this.deletePlayer
            }
        ].forEach(function (_a) {
            var url = _a.url, action = _a.action;
            return app.get(url, action);
        });
        app.listen(8000);
        console.log('Services started.');
    };
    Db.prototype["try"] = function (params) {
        var _this = this;
        var res = params.res, action = params.action, _a = params.onSuccess, onSuccess = _a === void 0 ? (function () { return res.sendStatus(200); }) : _a;
        var onError = function (error) {
            res.sendStatus(500);
            _this.printError(error);
        };
        action
            .then(onSuccess)["catch"](onError);
    };
    Db.prototype.printError = function (error) {
        console.log(error);
    };
    return Db;
}());
new Db();
