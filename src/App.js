import './App.css';
import Dashboard from './dashboard/Dashboard';
import Loading from './pages/Loading';
import {Redirect, Route, Switch, useLocation, useHistory} from "react-router-dom";
import SignInSide from './pages/SignInSide';
import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import ConnectPopup from "./pages/ConnectPopup";
import {gql, useQuery, useMutation} from '@apollo/client';
import 'typeface-roboto';

const ACTION_AUTH_SIGN_OUT = gql`
mutation {
  action_auth_sign_out {
    success
  }
}
`;

const ACTION_AUTH_STATUS = gql`
query ACTION_AUTH_STATUS {
    action_auth_status {
        id
        role
        username
        meta
    }
}
`;

const App = forwardRef((props, ref) => {

    useImperativeHandle(
        ref,
        () => ({
            async recheckAuth() {
                refetchAuthStatus();
            }
        })
    );

    const intendedUrl = useRef('/dashboard');
    const [doSignOut,] = useMutation(ACTION_AUTH_SIGN_OUT);
    const [loggedInUser, setLoggedInUser] = useState({id: null, role: '', username: ''});
    const location = useLocation();
    const history = useHistory();

    const {data: authData, error: authError, refetch: refetchAuthStatus} = useQuery(ACTION_AUTH_STATUS);

    useEffect(() => {
        setLoggedInUser(authData?.action_auth_status);
    }, [authData, setLoggedInUser])

    // useEffect( async () => {
    //     if(authData?.action_auth_status?.role === "user"){
    //         setLoggedInUser(false);
    //         intendedUrl.current = '/dashboard';
    //         const result = await doSignOut();
    //         if (result.data.action_auth_sign_out.success) history.replace('/sign-in');
    //     }
    // })

    if (!['/', '/connect', '/sign-in'].includes(location.pathname)) {
        intendedUrl.current = location.pathname;
    }

    const handleSignIn = () => {
        refetchAuthStatus()
    };

    return (
        <div className="App">
            <Switch>

                <Route exact path="/">
                    <Loading authError={authError} authLoading={authError} loggedInUser={loggedInUser}
                             intendedUrl={intendedUrl.current}/>
                </Route>

                <Route exact path="/sign-in">
                    {loggedInUser?.id && <Redirect to={intendedUrl.current}/>}
                    {loggedInUser?.id === null && <Redirect to={intendedUrl.current}/>}
                    {!loggedInUser?.id && <SignInSide onSignIn={handleSignIn}/>}
                </Route>

                <Route exact path="/connect">
                    <ConnectPopup/>
                </Route>

                <Route path="/dashboard">
                    {!loggedInUser?.id && <Redirect to="/"/>}
                    {loggedInUser?.id &&
                    <Dashboard loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser}
                               intendedUrl={intendedUrl} refetchAuthStatus={refetchAuthStatus}/>
                    }
                </Route>

            </Switch>
        </div>
    );
});

export default App;