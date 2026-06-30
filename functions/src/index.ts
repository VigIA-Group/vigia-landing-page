import {onRequest} from "firebase-functions/v2/https";
import {initializeApp} from "firebase-admin/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

initializeApp();

export const createContact = onRequest(
  {
    cors: ["*"],
    secrets: ["HUBSPOT_API_CRM"],
    invoker: "public",
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const {firstname, lastname, email, phone, company, jobtitle} = req.body;

    const db = getFirestore();
    await db.collection("contacts").add({
      firstname,
      lastname,
      email,
      phone,
      company,
      jobtitle,
      createdAt: FieldValue.serverTimestamp(),
    });

    const hubspotRes = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.HUBSPOT_API_CRM}`,
        },
        body: JSON.stringify({
          properties: {
            firstname,
            lastname,
            email,
            phone,
            company,
            jobtitle,
            registration_source: "landing page",
          },
        }),
      },
    );

    if (!hubspotRes.ok) {
      const err = await hubspotRes.json();
      console.error("HubSpot error:", err);
      res.status(500).json({error: "HubSpot falló", details: err});
      return;
    }

    res.status(200).json({ok: true});
  },
);
