const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 🇪🇸 SOLO ESPAÑA
const leagues = [
  { name: "LaLiga EA Sports", id: "4335" },
  { name: "LaLiga Hypermotion", id: "4400" },
  { name: "Copa del Rey", id: "4483" }
];

async function main() {
  const agendaRef = db.collection("agenda");

  // 🔥 BORRAR TODO LO ANTERIOR
  const old = await agendaRef.get();
  const batch = db.batch();
  old.forEach(doc => batch.delete(doc.ref));

  // 🔄 CARGAR NUEVA AGENDA
  for (const league of leagues) {
    const url = `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${league.id}`;
    
    const res = await fetch(url);
    const data = await res.json();

    const events = data.events || [];

    for (const event of events) {
      const ref = agendaRef.doc(event.idEvent);

      batch.set(ref, {
        liga: league.name,
        partido: event.strEvent || "",
        fecha: event.dateEvent || "",
        hora: event.strTime || "",
        estadio: event.strVenue || "",
        pais: "España",
        actualizado: new Date().toISOString()
      });
    }
  }

  await batch.commit();
  console.log("Agenda española actualizada 🇪🇸");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
