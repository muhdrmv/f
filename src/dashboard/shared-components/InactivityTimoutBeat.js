import {gql, useApolloClient} from "@apollo/client";
import {useLocation} from "react-router-dom";
import {windowAddActivityEventListeners} from "../../utilities/Utils";
import {useEffect, useRef} from "react";

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

const InactivityTimoutBeat = ({lastWindowActivityAt, doLogout}) => {
    const location = useLocation();

    const beatIntervalSeconds = 10;
    const beatIsActive = true;
    const intervalTimer = useRef();

    useEffect(() => {
        const updateActivity = () => {lastWindowActivityAt.current = new Date()};
        windowAddActivityEventListeners(window, updateActivity);
        intervalTimer.current = setInterval(contactServer, beatIntervalSeconds * 1000);
        return () => {
            clearInterval(intervalTimer.current);
        }
    }, []);

    const contactServer = async () => {
        if (!beatIsActive) return;
        let authStatus;
        const inactiveForMs = new Date() - lastWindowActivityAt.current;
        try {
            if (inactiveForMs < beatIntervalSeconds * 1000) {
                authStatus = await sendActivityToServer();
            } else {
                authStatus = await getStatusFromServer()
            }
            authStatusAction(authStatus);
        } catch (e) {
            console.log('beat error:', e.message);
        }
    };

    const gqlClient = useApolloClient();

    const sendActivityToServer = async () => {
        return await gqlClient.query({query: ACTION_AUTH_STATUS});
    };

    const getStatusFromServer = async () => {
        return await gqlClient.query({
            query: ACTION_AUTH_STATUS,
            context: {
                headers: {
                    "x-app-no-activity": "1"
                }
            },
        });
    };

    const authStatusAction = authStatus => {
        if (!authStatus?.data?.action_auth_status?.id)
            if (!location.pathname.startsWith('/sign-in'))
                doLogout();
    };

    return <></>

}

export default InactivityTimoutBeat;