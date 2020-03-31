"use strict";
exports.__esModule = true;
var cors = require("cors");
var express = require("express");
var mongodb_1 = require("mongodb");
var Db = /** @class */ (function () {
    function Db() {
        var _this = this;
        this.loadPLayer = function (req, res) {
            var _a = req.params, groupId = _a.groupId, playerId = _a.playerId;
            groupId = new mongodb_1.ObjectID(groupId);
            playerId = parseInt(playerId);
            _this["try"]({
                res: res,
                action: _this.players.findOne({ _id: { groupId: groupId, playerId: playerId } }),
                onSuccess: function (result) { return res.json(result); }
            });
        };
        this.savePlayer = function (req, res) {
            var _a = req.params, groupId = _a.groupId, playerId = _a.playerId;
            var _b = req.body, name = _b.name, points = _b.points;
            playerId = parseInt(playerId);
            if (groupId === 'new') {
                _this.insertPlayer(res, new mongodb_1.ObjectID(), playerId, name, points);
            }
            else {
                groupId = new mongodb_1.ObjectID(groupId);
                _this["try"]({
                    res: res,
                    action: _this.players.updateOne({ _id: { groupId: groupId, playerId: playerId } }, { $set: { name: name, points: points } }),
                    onSuccess: 
                    // Maybe updateOne had no effect (matchedCount = 0), because there was no record found with this id.
                    // In this case a new record has to be inserted.
                    function (_a) {
                        var matchedCount = _a.matchedCount;
                        if (matchedCount === 0) {
                            _this.insertPlayer(res, groupId, playerId, name, points);
                        }
                        else {
                            res.json(groupId);
                        }
                    }
                });
            }
        };
        this.deletePlayer = function (req, res) {
            var _a = req.params, groupId = _a.groupId, playerId = _a.playerId;
            groupId = new mongodb_1.ObjectID(groupId);
            playerId = parseInt(playerId);
            _this["try"]({
                res: res,
                action: _this.players.deleteOne({ _id: { groupId: groupId, playerId: playerId } }),
                onSuccess: function () { return res.sendStatus(200); }
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
        var resource = '/:groupId/:playerId';
        app.use(cors());
        app.use(express.json());
        app.get(resource, this.loadPLayer);
        app.put(resource, this.savePlayer);
        app["delete"](resource, this.deletePlayer);
        app.listen(8000);
        console.log('Services started.');
    };
    Db.prototype.insertPlayer = function (res, groupId, playerId, name, points) {
        this["try"]({
            res: res,
            action: this.players.insertOne({ _id: { groupId: groupId, playerId: playerId }, name: name, points: points }),
            onSuccess: function () { return res.json(groupId); }
        });
    };
    Db.prototype["try"] = function (_a) {
        var _this = this;
        var res = _a.res, action = _a.action, onSuccess = _a.onSuccess;
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
