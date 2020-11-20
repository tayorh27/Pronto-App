/// <reference lib="webworker" />
// import * as firebase from 'firebase/app'
// import 'firebase/firestore'

// function c() {
//   const email = localStorage.getItem('email')
//   firebase.firestore().collection('jobs').where('assigned_to.email', '==', email).where('back_end_status', '==', 'active').onSnapshot(query => {
//     postMessage({ "type": "job" })
//   })
// }

addEventListener('message', ({ data }) => {
  const response = `worker response to ${data}`;
  console.log(response)
  postMessage(response);
  // c()
});


