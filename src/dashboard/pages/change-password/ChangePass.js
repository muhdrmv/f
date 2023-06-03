import {Grid, Paper} from "@material-ui/core";
import TopToolbar from "./TopToolbar";
import BottomToolbar from "./BottomToolbar";
import React, {useState} from "react";
import {gql, useMutation} from "@apollo/client";
import {useHistory} from "react-router-dom";
import {makeStyles} from "@material-ui/core/styles";
import PasswordTextField from "../../shared-components/PasswordTextField";

const useStyles = makeStyles((theme) => ({
    form: {
        padding: theme.spacing(2),
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(1),
    },

}));

const CHANGE_PASSWORD = gql`
  mutation ($currentPassword: String!, $newPassword: String!) {
    action_auth_change_password(currentPassword: $currentPassword, newPassword: $newPassword) {
      success
    }
  }
`;

const ChangePass = ({setSnackbarState, setAlertDialogOpen, setAlertMessage}) => {
    const classes = useStyles();

    const [inProgress, setInProgress] = useState(false);
    const [formState, setFormState] = useState({
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: '',
    });
    const [validationErrorState, setValidationErrorState] = useState({
        currentPassword: false,
        newPassword: false,
        newPasswordConfirm: false
    });

    const [updatePassword,] = useMutation(CHANGE_PASSWORD);

    const handleChangeTextField = e => {
        setFormState(s => ({...s, [e.target.name]: e.target.value}));
        const setAll = (obj, val) => Object.keys(obj).forEach(k => obj[k] = val);
        setValidationErrorState(s => {setAll(s, false); return s;});
    }

    const history = useHistory();

    const handleFormSubmit = async e => {

        if (!formState.currentPassword) {
            setValidationErrorState(s => ({...s, currentPassword: true}));
            return;
        }

        if (!formState.newPassword || !formState.newPasswordConfirm) {
            setValidationErrorState(s => ({...s, newPassword: true, newPasswordConfirm: true}));
            return;
        }

        if (formState.newPassword !== formState.newPasswordConfirm) {
            setValidationErrorState(s => ({...s, newPassword: true, newPasswordConfirm: true}));
            return;
        }

        setInProgress(true);
        const {
            currentPassword,
            newPassword,
        } = formState;
        try {
            const mutationResult = await updatePassword({
                variables: {
                    currentPassword,
                    newPassword,
                }
            });
            console.log(mutationResult);
            setSnackbarState({message: 'Successful', isOpen: true})
            setTimeout(() => {
                setSnackbarState(s => ({...s, isOpen: false}));
            }, 1000);
            window.location.reload();
        } catch (e) {
            setAlertDialogOpen(true);
            setAlertMessage(e.message);
        }
        setInProgress(false);
    };

    return (
        <Paper className={classes.paper}>
            <TopToolbar toolbarTitle="Change Password" backLinkUrl="/dashboard"
                        onClickDone={handleFormSubmit} inProgress={inProgress}/>
            <div className={classes.root}>
                <form className={classes.form} noValidate autoComplete="off" onSubmit={handleFormSubmit}>
                    <Grid container spacing={3}>
                            <Grid item xs={4}>
                                <PasswordTextField id="current-password" label="Current Password" variant="outlined" fullWidth
                                           onChange={handleChangeTextField} name="currentPassword"
                                           value={formState.currentPassword}
                                           error={validationErrorState.currentPassword}/>
                            </Grid>
                            <Grid item xs={4}>
                                <PasswordTextField id="new-password" label="New Password"
                                                   variant="outlined" fullWidth
                                                   onChange={handleChangeTextField} name="newPassword"
                                                   value={formState.newPassword}
                                                   error={validationErrorState.newPassword}
                                                   helperText="A complex password includes a-z, A-Z, 0-9 and symbols" />
                            </Grid>
                            <Grid item xs={4}>
                                <PasswordTextField id="new-password-confirm" label="New Password Confirm"
                                           variant="outlined"
                                           fullWidth
                                           onChange={handleChangeTextField} name="newPasswordConfirm"
                                           value={formState.newPasswordConfirm}
                                           error={validationErrorState.newPasswordConfirm}/>
                            </Grid>
                    </Grid>
                    <BottomToolbar backLinkUrl="/dashboard" onClickDone={handleFormSubmit}
                                   inProgress={inProgress}/>
                </form>
            </div>
        </Paper>
    )
};

export default ChangePass;