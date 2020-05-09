import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

const config = {
    apiKey: "AIzaSyDBOWPDT3OPAsHhh3oMjfNiv5W4SbNQL9w",
    authDomain: "live-chat-om.firebaseapp.com",
    databaseURL: "https://live-chat-om.firebaseio.com",
    projectId: "live-chat-om",
    storageBucket: "live-chat-om.appspot.com",
    messagingSenderId: "14020412026",
    appId: "1:14020412026:web:8c0c2ae9c0dca88680b1c3",
    measurementId: "G-K0R3F5BE00"
  };

  firebase.initializeApp(config);

  export default firebase;