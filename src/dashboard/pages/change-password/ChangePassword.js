import React, {useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Snackbar} from '@material-ui/core';
import AlertDialog from "../../../pages/AlertDialog";
import Enable2FA from "./Enable2FA";
import Disable2FA from "./Disable2FA";
import ChangePass from "./ChangePass";

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
    },
}));


const ChangePassword = ({loggedInUser}) => {
    const classes = useStyles();

    const [snackbarState, setSnackbarState] = useState({
        isOpen: false,
        message: ''
    });

    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const handleDialogClose = () => {
        setAlertDialogOpen(false);
    }

    return (
        <div className={classes.root} style={{width: '100%'}}>

            { loggedInUser?.meta?.authType !== 'external' &&
                <ChangePass setAlertDialogOpen={setAlertDialogOpen}
                            setSnackbarState={setSnackbarState}
                            setAlertMessage={setAlertMessage} />
            }

            { loggedInUser?.meta?.auth2FASecret &&
                <Disable2FA />
            }

            { !loggedInUser?.meta?.auth2FASecret &&
                <Enable2FA />
            }


            <Snackbar
                open={snackbarState.isOpen}
                // onClose={handleSnackbarClose}
                // TransitionComponent={(<Slide direction="up" />)}
                message={snackbarState.message}
                // key={SlideTransition.name}
            />

            <AlertDialog isOpen={alertDialogOpen} closeMe={handleDialogClose} message={alertMessage} />

        </div>


    )
}

export default ChangePassword;
