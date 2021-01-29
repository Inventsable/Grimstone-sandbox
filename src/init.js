import firebase from "firebase/app";
import firestore from "firebase/firestore";
import config from "../config";
export default firebase
  .initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    appId: config.appId,
    projectId: config.projectId
  })
  .firestore();
