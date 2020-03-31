import * as cors from 'cors';
import * as express from 'express';
import { MongoClient, ObjectID } from 'mongodb';

class Db {
  private players;

  constructor() {
    MongoClient
      .connect('mongodb+srv://admin:m372fvzZde3z2Hk@tictactoe-yq7zv.mongodb.net/test?retryWrites=true&w=majority', { useUnifiedTopology: true })
      .then(client => {
        this.players = client.db('tictactoe').collection('players');
        console.log('Connected to DB.');

        this.startServices();
      })
      .catch(this.printError);
  }

  private startServices() {
    const app = express();
    const resource = '/v1/:groupId/:playerId';

    app.use(cors());
    app.use(express.json());

    app.get(resource, this.loadPLayer);
    app.put(resource, this.savePlayer);
    app.delete(resource, this.deletePlayer);

    app.listen(8000);
    console.log('Services started.');
  }

  public loadPLayer = (req, res) => {
    let { groupId, playerId } = req.params;

    groupId = new ObjectID(groupId);
    playerId = parseInt(playerId);

    this.try({
      res,
      action: this.players.findOne({ _id: { groupId, playerId } }),
      onSuccess: result => res.json(result)
    });
  }

  public savePlayer = (req, res) => {
    let { groupId, playerId } = req.params;
    const { name, points } = req.body;

    playerId = parseInt(playerId);

    if (groupId === 'new') {
      this.insertPlayer(res, new ObjectID(), playerId, name, points);
    } else {
      groupId = new ObjectID(groupId);

      this.try({
        res,
        action: this.players.updateOne({ _id: { groupId, playerId } }, { $set: { name, points } }),
        onSuccess:
          // Maybe updateOne had no effect (matchedCount = 0), because there was no record found with this id.
          // In this case a new record has to be inserted.
          ({ matchedCount }) => {
            if (matchedCount === 0) {
              this.insertPlayer(res, groupId, playerId, name, points);
            } else {
              res.json(groupId);
            }
          }
      });
    }
  }

  private insertPlayer(res, groupId, playerId, name, points) {
    this.try({
      res,
      action: this.players.insertOne({ _id: { groupId, playerId }, name, points }),
      onSuccess: () => res.json(groupId)
    });
  }

  public deletePlayer = (req, res) => {
    let { groupId, playerId } = req.params;

    groupId = new ObjectID(groupId);
    playerId = parseInt(playerId);

    this.try({
      res,
      action: this.players.deleteOne({ _id: { groupId, playerId } }),
      onSuccess: () => res.sendStatus(200)
    });
  }

  private try({ res, action, onSuccess }) {
    const onError = (error) => {
      res.sendStatus(500);
      this.printError(error);
    }

    action
      .then(onSuccess)
      .catch(onError);
  }

  private printError(error) {
    console.log(error);
  }
}

new Db();
