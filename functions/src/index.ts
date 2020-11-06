import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as expres from 'express';
import * as cors from 'cors';

const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://firestore-grafica-47093.firebaseio.com",
});

const db = admin.firestore();
export const helloWorld = functions.https.onRequest((request, response) => {
  response.json({mensaje: "Hello from Firebase fucntions!???"});
});

export const getGOTY = functions.https.onRequest(async (request, response) => {
  // const nombre = request.query.nombre || 'Sin nombre';
  const gotyRef = db.collection('goty');
  const docsSnap = await  gotyRef.get();
  const juegos = docsSnap.docs.map(doc => doc.data())
  response.json(juegos)
});

// Express
const app = expres();
app.use(cors({origin: true}));

app.get('/goty', async (req, res) => {
  const gotyRef = db.collection('goty');
  const docsSnap = await  gotyRef.get();
  const juegos = docsSnap.docs.map(doc => doc.data())
  res.json(juegos)
})

app.post('/goty/:id', async (req, res) => {
  const id = req.params.id;
  const gameRef = db.collection('goty').doc(id);
  const gameSnap = await gameRef.get()

  if (!gameSnap.exists) {
    res.status(404).json({
      ok: false,
      mensaje: 'No existe un juego con el ID ' + id,
    })
  } else {
    const antes = gameSnap.data() || {votes: 0}
    await gameRef.update({
      votes: antes.votes + 1,
    })
    res.json({
      ok: true,
      mensaje: `Gracias por tu votó a ${ antes.name }`,
    })
  }
})

export const api = functions.https.onRequest(app)