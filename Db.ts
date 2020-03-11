import * as cors from 'cors';
import * as express from 'express';
import { MongoClient } from 'mongodb';

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
    ].forEach(({ url, action }) => app.get(url, action));

    app.listen(8000);
    console.log('Services started.');
  }

  public loadPLayer = (req, res) => {
    const _id = parseInt(req.params.id);

    this.try({
      res,
      action: this.players.findOne({ _id }),
      onSuccess: result => res.json(result)
    });
  }

  public savePlayer = (req, res) => {
    const _id = parseInt(req.params.id);
    const { name, points } = req.params;

    this.try({
      res,
      action: this.players.updateOne({ _id }, { $set: { name, points } }),
      onSuccess:
        // Maybe updateOne had no effect (matchedCount = 0), because there was no record found with this id.
        // In this case a new record has to be inserted.
        ({ matchedCount }) => {
          if (matchedCount === 0) {
            this.try({
              res,
              action: this.players.insertOne({ _id, name, points })
            });
          } else {
            res.sendStatus(200);
          }
        }
    });
  }

  public deletePlayer = (req, res) => {
    const _id = parseInt(req.params.id);

    this.try({
      res,
      action: this.players.deleteOne({ _id })
    });
  }

  private try(params: { res, action, onSuccess?}) {
    const { res, action, onSuccess = (() => res.sendStatus(200)) } = params;

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
