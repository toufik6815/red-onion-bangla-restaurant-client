import * as firebase from 'firebase/app';
import 'firebase/auth';
import firebaseConfig from '../SignUp/firebase.config';
import React , { useState,createContext,useContext , useEffect} from 'react';
import {Route,Redirect} from 'react-router-dom';


firebase.initializeApp(firebaseConfig);

const AuthContext = createContext()
export const AuthProvider = (props) => {
    const auth = Auth();
    return <AuthContext.Provider value={auth}> {props.children} </AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext);

export const  PrivateRoute = ({ children, ...rest }) => {
    const auth = useAuth();
    return (
      <Route
        {...rest}
        render={({ location }) =>
          auth.user ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: location }
              }}
            />
          )
        }
      />
    );
  }



  //Google Sign In
  export const handleGoogleSignIn = () => {
    const googleSignIn = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(googleSignIn)
      .then(res => {
        window.history.back();
      })
      .catch(function (error) {
        console.log(error);
        console.log(error.message);
      });
  };

  //Facebook Sign In
  export const handleFacebookSignIn = () => {
    const facebookSignIn = new firebase.auth.FacebookAuthProvider();
    firebase
      .auth()
      .signInWithPopup(facebookSignIn)
      .then((res) => {
        window.history.back();
      })
      .catch(function (error) {
        console.log(error);
        console.log(error.message);
      });
  };


const Auth = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
      firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
             const currUser = user;
             setUser(currUser);
          }
        });
        
    },[])

    const signIn = (email,password) => {
        return firebase.auth().signInWithEmailAndPassword(email,password)
       .then(res => {
           setUser(res.user);
           window.history.back(); 
        })
        .catch(err=> setUser({error: err.message}))
    }

   

    const signUp = (email, password, name) => {
        return firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(res => {
            firebase.auth().currentUser.updateProfile({
                displayName: name
            }).then(() => {
              setUser(res.user);
              verifyEmail();
              window.history.back(); 
            });
        })
        .catch(err=> setUser({error: err.message}))
    }


    //Verify Email Address
    const verifyEmail = () => {
      var user = firebase.auth().currentUser;
      user
        .sendEmailVerification()
        .then(function () {
          // Email sent.
        })
        .catch(function (error) {
          console.log(error);
        });
    }

    

    const signOut = () => {
        return firebase.auth().signOut()
        .then(res => setUser(null))
    }

    return{
        user,
        signIn,
        signUp,
        signOut
    }
}

export default Auth;