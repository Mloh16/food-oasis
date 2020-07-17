import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import theme from "theme/materialUI";
import { UserContext } from "components/user-context";
import Toast from "components/Toast";
import Header from "components/Header";
import StakeholdersContainer from "components/StakeholdersContainer";
import VerificationAdmin from "./components/Verification/VerificationAdmin";
import VerificationDashboard from "./components/Verification/VerificationDashboard";
import SecurityAdminDashboard from "./components/SecurityAdminDashboard/SecurityAdminDashboard";
import StakeholderEdit from "./components/StakeholderEdit";
import Donate from "./components/StaticPages/Donate";
import Resources from "./components/Resources";
import About from "./components/StaticPages/About";
import Register from "./components/Register";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Footer from "./components/Footer";
import ConfirmEmail from "./components/ConfirmEmail";
import Faq from "./components/StaticPages/Faq";
import FaqEdit from "./components/FaqEdit";
import FaqAdd from "./components/FaqAdd";
import Home from "./containers/Home";
import ResultsContainer from "components/ResultsContainer";
import { logout } from "./services/account-service";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  app: (props) => ({
    color: "black",
    margin: "0",
    height: "100%",
  }),
  mainContent: {
    margin: "0",
    flexGrow: 1,
  },
  stakeholderEditWrapper: {
    flexBasis: "90%",
    paddingTop: "1em",
    paddingBottom: "1em",
  },
  homeWrapper: {
    backgroundSize: "cover",
    minHeight: "max(100vh,20em)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  verificationAdminWrapper: {
    flexBasis: "100%",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [userCoordinates, setUserCoordinates] = useState({});
  const [toast, setToast] = useState({ message: "" });
  const [bgImg, setBgImg] = useState("");
  const [origin, setOrigin] = useState({
    latitude: 34.0522,
    longitude: -118.2437,
  });

  useEffect(() => {
    const imgNum = Math.floor(Math.random() * (21 - 1)) + 1;
    const backgroundImage = `url("/landing-page/${imgNum}.jpg")`;
    setBgImg(backgroundImage);
  }, []);

  useEffect(() => {
    const storedJson = sessionStorage.getItem("user");
    const userJson = JSON.stringify(user);
    if (!userJson && !storedJson) {
      return;
    } else if (userJson === storedJson) {
      return;
    } else {
      setUser(JSON.parse(storedJson));
    }
  }, [user, userCoordinates]);

  useEffect(() => {
    fetchLocation();
  }, []);

  const onLogin = (user) => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
      logout();
    }
    setUser(user);
  };

  const fetchLocation = () => {
    let userCoordinates = { latitude: null, longitude: null };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (position) {
            const userCoordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setUserCoordinates(userCoordinates);
          }
        },
        (error) => {
          console.log(`Getting browser location failed: ${error.message}`);
          const userCoordinates = {
            latitude: 34.0522,
            longitude: -118.2437,
          };
          setUserCoordinates(userCoordinates);
        }
      );
    } else {
      // If browser location permission is denied, the request is
      // "successful", but the result is null coordinates.
      console.log("Enable location permission to use location-based features.");
    }

    return userCoordinates;
  };

  const classes = useStyles();

  return (
    <UserContext.Provider value={user}>
      <ThemeProvider theme={theme}>
        <Router>
          <Grid
            container
            direction="column"
            wrap="nowrap"
            justify="stretch"
            spacing={0}
            classes={{
              container: classes.app,
            }}
          >
            <Header user={user} setUser={onLogin} setToast={setToast} />
            <Switch className={classes.mainContent}>
              <Route exact path="/">
                <div
                  className={classes.homeWrapper}
                  style={{ backgroundImage: bgImg }}
                >
                  <Home
                    userCoordinates={userCoordinates}
                    origin={origin}
                    setOrigin={setOrigin}
                  />
                </div>
              </Route>
              <Route path="/organizations">
                <ResultsContainer
                  userCoordinates={userCoordinates}
                  userSearch={origin}
                />
              </Route>
              <Route path="/stakeholders">
                <StakeholdersContainer
                  user={user}
                  userCoordinates={userCoordinates}
                />
              </Route>
              <Route path="/organizationedit/:id?">
                <div className={classes.stakeholderEditWrapper}>
                  <StakeholderEdit setToast={setToast} user={user} />
                </div>
              </Route>
              <Route path="/verificationdashboard">
                <div className={classes.verificationAdminWrapper}>
                  <VerificationDashboard
                    user={user}
                    userCoordinates={userCoordinates}
                  />
                </div>
              </Route>
              <Route path="/verificationadmin">
                <div className={classes.verificationAdminWrapper}>
                  <VerificationAdmin
                    user={user}
                    userCoordinates={userCoordinates}
                  />
                </div>
              </Route>
              <Route path="/securityadmindashboard">
                <div className={classes.verificationAdminWrapper}>
                  <SecurityAdminDashboard
                    user={user}
                    userCoordinates={userCoordinates}
                  />
                </div>
              </Route>

              <Route path="/donate">
                <Donate />
              </Route>
              {/* <Route path="/news">
                <News />
              </Route> */}
              <Route path="/resources">
                <Resources />
              </Route>
              <Route path="/about">
                <About />
              </Route>
              {/* <Route path="/team">
                <Team />
              </Route> */}
              <Route exact path="/faqs">
                <Faq />
              </Route>
              <Route path="/faqs/add">
                <FaqAdd />
              </Route>
              <Route path="/faqs/:identifier">
                <FaqEdit setToast={setToast} />
              </Route>
              <Route path="/register">
                <Register setToast={setToast} />
              </Route>
              <Route path="/confirm/:token">
                <ConfirmEmail setToast={setToast} />
              </Route>
              <Route path="/login/:email?">
                <Login user={user} setUser={onLogin} setToast={setToast} />
              </Route>
              <Route path="/forgotpassword/:email?">
                <ForgotPassword setToast={setToast} />
              </Route>
              <Route path="/resetPassword/:token">
                <ResetPassword setToast={setToast} />
              </Route>
            </Switch>
            <Toast toast={toast} setToast={setToast} />
            {}
            <Grid item>
              <Footer />
            </Grid>
          </Grid>
        </Router>
      </ThemeProvider>
    </UserContext.Provider>
  );
}

export default App;
