import * as cors from 'cors';
import * as express from 'express';
import { MongoClient } from 'mongodb';

class Db {
  private players;

  constructor() {
    this.try(
      MongoClient
        .connect('mongodb+srv://admin:m372fvzZde3z2Hk@tictactoe-yq7zv.mongodb.net/test?retryWrites=true&w=majority', { useUnifiedTopology: true })
        .then(client => {
          this.players = client.db('tictactoe').collection('players');
          console.log('Connected to DB.');

          this.startServices();
        })
    );
  }

  private startServices(): void {
    const app = express();
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
    ].forEach(({ params, action }) => app.get(params, action));

    app.listen(8000);
    console.log('Services started.');
  }

  public loadPLayer = (req, res): void => {
    this.try(
      this.players
        .findOne({ _id: this.toInt(req.params._id) })
        .then(data => res.json(data))
    );
  }

  public savePlayer(req, res): void {
    let { _id, name, points } = req.params;
    _id = this.toInt(_id);

    this.players
      .updateOne({ _id }, { $set: { name, points } })
      .then(res.send('Updated.'))
      .catch(
        this.try(
          this.players
            .insertOne({ _id, name, points })
            .then(res.send('Saved.'))
        )
      );
  }

  public deletePlayer = (req, res): void => {
    this.try(
      this.players
        .deleteOne({ _id: this.toInt(req.params._id) })
        .then(res.send('Deleted.'))
    );
  }

  private toInt(value: string): number {
    return parseInt(value, 10);
  }

  private try(promise: Promise<String>): void {
    promise.catch(error => console.log(error));
  }
}

new Db();
