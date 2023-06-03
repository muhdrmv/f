import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Button, Grid, MenuItem, Paper, Snackbar, TextField} from '@material-ui/core';
import CheckboxesTags from '../../shared-components/CheckboxesTags';
import {useHistory, useParams} from "react-router-dom";
import {gql, useApolloClient, useLazyQuery, useMutation, useQuery} from '@apollo/client';
import TopToolbar from '../../shared-components/TopToolbar';
import BottomToolbar from '../../shared-components/BottomToolbar';
import Hashes from 'jshashes';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import JalaliDatePicker from "../../../utilities/JalaliDatePicker";
import PasswordTextField from "../../shared-components/PasswordTextField";


const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
    },
    form: {
        padding: theme.spacing(2),
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(1),
    },

}));

const QUERY_USER = gql`
query ($id: uuid!) {
  users_by_pk(id: $id){
    id
    username
    password
    name
    role
    meta
    user_group_users {
        user_group_id
    }
  }
}
`;

const USER_USERNAME_EXISTS = gql`
query ($username: String!) {
  users(where: {username: {_eq: $username}}){
    id
  }
}
`;

const INSERT_USER = gql`
mutation ($username: String!, $name: String!, $password: String!, $role: String!, $meta: jsonb!, $user_groups: [user_group_user_insert_input!]!) {
  insert_users(objects: {
      username: $username, 
      name: $name, 
      password: $password, 
      role: $role, 
      meta: $meta,
      user_group_users: {data: $user_groups},
    }) {
    returning {
      id
    }
  }
}
`;

const UPDATE_USER = gql`
mutation ($username: String!, $name: String!, $password: String!, $role: String!, $meta: jsonb!, $user_groups: [user_group_user_insert_input!]!, $id: uuid!) {
  update_users_by_pk(pk_columns: {id: $id}, _set: {
      username: $username, 
      name: $name, 
      password: $password, 
      role: $role,
      meta: $meta,
    }) {
    id
  }
  delete_user_group_user (where: {user_id: {_eq: $id}}) {
    affected_rows
  }
  insert_user_group_user (objects: $user_groups) {
    affected_rows
  }
}
`;

const QUERY_USER_GROUPS = gql`
query {
  user_groups {
    id
    name
  }
}
`;

const SET_2FA = gql`
  mutation ($userId: uuid!, $accountPassword: String!, $oneTimePassword: String!, $secret: String!) {
    action_auth_set_2fa(userId: $userId, accountPassword: $accountPassword, oneTimePassword: $oneTimePassword, secret: $secret) {
      success
    }
  }
`;


const UserEdit = ({insertMode = false, loggedInUser}) => {
    const classes = useStyles();

    const [inProgress, setInProgress] = useState(false);
    const [username, setUsername] = useState('');
    const [tags, setTags] = useState([]);
    const [items, setItems] = useState([]);
    const [formState, setFormState] = useState({
        name: '',
        firstname: '',
        lastname: '',
        username: '',
        authType: 'internal',
        isDisabled: false,
        auth2FASecret: null,
        mustChangePassword: true,
        expiresAt: null,
        allowedIPAddress: '',
        password: '',
        passwordConfirm: '',
        currentPassword: '',
        role: 'user'
    });
    const [validationErrorState, setValidationErrorState] = useState({
        username: false,
        password: false,
        passwordConfirm: false
    });
    const [snackbarState, setSnackbarState] = useState({
        isOpen: false,
        message: ''
    });
    const {id} = useParams();

    const handleQueryCompletedGroups = data => {
        const checkboxItems = data.user_groups.map(i => ({id: i.id, title: i.name}));
        setItems(checkboxItems);
    };

    useQuery(QUERY_USER_GROUPS, {
        onCompleted: handleQueryCompletedGroups,
    });

    const [queryData, {data}] = useLazyQuery(QUERY_USER, {
        variables: {id: id},
    });

    useEffect(() => {
        if (!insertMode) {
            queryData();
        }
    }, []);

    useEffect(() => {
        if (data) {
            const user = data.users_by_pk;
            setUsername(user.username);
            const userGroupIds = user.user_group_users.map(i => i.user_group_id);
            setTags(userGroupIds);
            setInProgress(false);
            setFormState(s => ({
                ...s,
                name: user.name,
                firstname: user.name.split('\n')?.[0],
                lastname: user.name.split('\n')?.[1],
                username: user.username,
                role: user.role,
                authType: user.meta.authType,
                isDisabled: user.meta.isDisabled,
                auth2FASecret: user.meta.auth2FASecret,
                mustChangePassword: user.meta.mustChangePassword,
                allowedIPAddress: user.meta.allowedIPAddress,
                expiresAt: user.meta.expiresAt ?? null,
                currentPassword: user.password,
            }));
        } else {
            !insertMode && setInProgress(true);
        }
    }, [data]);


    const [insertUser,] = useMutation(INSERT_USER);
    const [updateUser,] = useMutation(UPDATE_USER);
    const gqlClient = useApolloClient();

    const handleChangeName = (e) => {
        setFormState(s => ({...s, name: e.target.value}));
    }

    const handleChangeFirstname = (e) => {
        setFormState(s => ({...s, firstname: e.target.value}));
    }

    const handleChangeLastname = (e) => {
        setFormState(s => ({...s, lastname: e.target.value}));
    }

    const handleChangeUsername = (e) => {
        setFormState(s => ({...s, username: e.target.value}));
        setValidationErrorState(s => ({...s, username: false}));
    }

    const handleChangeTags = (e, v) => {
        const selectedIds = v.map(i => i.id);
        setTags(selectedIds);
    };

    const handleChangeAuthType = (e) => {
        setFormState(s => ({...s, authType: e.target.value}));
    }

    const handleChangePassword = (e) => {
        setFormState(s => ({...s, password: e.target.value}));
        setValidationErrorState(s => ({...s, password: false, passwordConfirm: false}));
    }

    const handleChangePasswordConfirm = (e) => {
        setFormState(s => ({...s, passwordConfirm: e.target.value}));
        setValidationErrorState(s => ({...s, password: false, passwordConfirm: false}));
    }

    const handleChangeRole = (e) => {
        setFormState(s => ({...s, role: e.target.value}));
    }

    const handleChangeAllowedIPAddress = (e) => {
        setFormState(s => ({...s, allowedIPAddress: e.target.value}));
    }

    const handleChangeIsDisabled = (e) => {
        setFormState(s => ({...s, isDisabled: e.target.checked}));
    }

    const handleMustChangePassword = (e) => {
        setFormState(s => ({...s, mustChangePassword: e.target.checked}));
    }

    const handleChangeExpiresAt = (v) => {
        setFormState(s => ({...s, expiresAt: v}));
    }

    const history = useHistory();

    const usernameExists = async (username) => {
        const result = await gqlClient.query({query: USER_USERNAME_EXISTS, variables: {username}})
        return result?.data?.users?.length;
    }

    const handleFormSubmit = async e => {

        if (formState.username.trim() === '') {
            setValidationErrorState(s => ({...s, username: true}));
            return;
        }

        if (insertMode && formState.authType === 'internal' && 
            (formState.password === '' || formState.password !== formState.passwordConfirm)) {
            setValidationErrorState(s => ({...s, password: true, passwordConfirm: true}));
            return;
        }

        if (!insertMode && formState.authType === 'internal' && 
            (formState.password !== formState.passwordConfirm)) {
            setValidationErrorState(s => ({...s, password: true, passwordConfirm: true}));
            return;
        }
        
        const userGroups = tags.map(i => ({user_id: id, user_group_id: i}));

        const passwordSalt = process.env.REACT_APP_PASSWORD_SALT;
        const hashedNewPassword = new Hashes.SHA1().hex(passwordSalt + formState.password);
        const password = (formState.password === '') ? formState.currentPassword : hashedNewPassword;

        setInProgress(true);
        let mutationResult;
        try {
            if (formState.username !== username && await usernameExists(formState.username)) {
                alert(`A user already exists with username "${formState.username}"`);
                throw Error('Duplicate username')
            }
            if (insertMode) {
                mutationResult = await insertUser({
                    variables: {
                        name:     formState.firstname + '\n' + formState.lastname,
                        username: formState.username,
                        password: password,
                        role:     formState.role,
                        meta: {
                            authType: formState.authType,
                            isDisabled: formState.isDisabled,
                            mustChangePassword: (formState.authType === 'external') ? false : formState.mustChangePassword,
                            allowedIPAddress: formState.allowedIPAddress,
                            expiresAt: formState.expiresAt,
                        },
                        user_groups: userGroups,
                    }
                });
            } else {
                mutationResult = await updateUser({
                    variables: {
                        name:     formState.firstname + '\n' + formState.lastname,
                        username: formState.username,
                        password: password,
                        role:     formState.role,
                        meta: {
                            authType: formState.authType,
                            isDisabled: formState.isDisabled,
                            mustChangePassword: formState.mustChangePassword,
                            allowedIPAddress: formState.allowedIPAddress,
                            expiresAt: formState.expiresAt,
                        },
                        user_groups: userGroups,
                        id: id
                    }
                });
            }
            console.log(mutationResult);
            setSnackbarState({message: 'Successful', isOpen: true})
            setTimeout(() => {
                setSnackbarState(s => ({...s, isOpen: false}));
            }, 1000);
            history.push('/dashboard/users');
        } catch (e) {
            console.log(e)
            alert('Data access error');
        }
        setInProgress(false);
    };

    const ExtraButtons = () => {
        const [setup2FA,] = useMutation(SET_2FA);
        const handleClickDisable2FA = async () => {
            try {
                const mutationResult = await setup2FA({
                    variables: {
                        userId: id,
                        accountPassword: '',
                        oneTimePassword: '',
                        secret: '',
                    }
                });
                console.log(mutationResult);
            } catch (e) {
                alert(e.message);
            }
            history.push('/dashboard/users');
        }
        return (
            <>
            { formState.auth2FASecret &&
                    <Button onClick={handleClickDisable2FA} size="large"
                            style={{marginRight: 7, marginLeft: 7}}>
                        Disable 2FA
                    </Button>
            }
            </>
        )
    }

    return (
        <div className={classes.root} style={{width: '100%'}}>
            <Paper className={classes.paper}>

                <TopToolbar toolbarTitle={(insertMode ? "Add" : "Edit") + " User"} backLinkUrl="/dashboard/users"
                            onClickDone={handleFormSubmit} inProgress={inProgress}/>

                <div className={classes.root}>
                    <form className={classes.form} noValidate autoComplete="off" onSubmit={handleFormSubmit}>
                        <input type="password" hidden />
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <TextField id="username" label="Username" variant="outlined" fullWidth type="text"
                                           onChange={handleChangeUsername}
                                           value={formState.username} error={validationErrorState.username} required/>
                            </Grid>

                            <Grid item xs={3}>
                                <TextField label="First Name" variant="outlined" fullWidth
                                           onChange={handleChangeFirstname}
                                           value={formState.firstname}/>
                            </Grid>

                            <Grid item xs={3}>
                                <TextField label="Last Name" variant="outlined" fullWidth
                                           onChange={handleChangeLastname}
                                           value={formState.lastname}/>
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    id="role"
                                    select
                                    label="Role"
                                    value={formState.role}
                                    onChange={handleChangeRole}
                                    variant="outlined"
                                    fullWidth>
                                    <MenuItem key='user' value='user'>
                                        User
                                    </MenuItem>
                                    { loggedInUser.role === 'administrator' &&
                                        <MenuItem key='sessionMonitoring' value='sessionMonitoring'>
                                            Session Monitoring
                                        </MenuItem>
                                    }
                                    { ['administrator', 'moderator', 'supervisor'].includes(loggedInUser.role)  &&
                                        <MenuItem key='supervisor' value='supervisor'>
                                            Supervisor
                                        </MenuItem>
                                    }
                                    { ['administrator', 'moderator'].includes(loggedInUser.role)  &&
                                        <MenuItem key='moderator' value='moderator'>
                                            Moderator
                                        </MenuItem>
                                    }
                                    { loggedInUser.role === 'administrator' &&
                                        <MenuItem key='auditor' value='auditor'>
                                            Auditor
                                        </MenuItem>
                                    }
                                    { loggedInUser.role === 'administrator' &&
                                        <MenuItem key='administrator' value='administrator'>
                                            Administrator
                                        </MenuItem>
                                    }
                                </TextField>
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    id="authType"
                                    select
                                    label="Authentication Type"
                                    value={formState.authType}
                                    onChange={handleChangeAuthType}
                                    helperText="Use internal password, or use external services to authenticate user"
                                    variant="outlined"
                                    fullWidth>
                                    <MenuItem key='internal' value='internal'>
                                        Internal
                                    </MenuItem>
                                    <MenuItem key='external' value='external'>
                                        External
                                    </MenuItem>
                                </TextField>
                            </Grid>

                            {(formState.authType === "internal") && <>
                                <Grid item xs={6}>
                                    <PasswordTextField id="password"
                                                       label={ insertMode ? "Password" : "Change Password" }
                                                       variant="outlined" fullWidth
                                                       onChange={handleChangePassword}
                                                       value={formState.password}
                                                       error={validationErrorState.password} />
                                </Grid>
                                <Grid item xs={6}>
                                    <PasswordTextField id="password-confirm"
                                                       label={ insertMode ? "Password Confirm" : "Change Password Confirm" }
                                                       variant="outlined" fullWidth
                                                       onChange={handleChangePasswordConfirm}
                                                       value={formState.passwordConfirm}
                                                       error={validationErrorState.passwordConfirm} />
                                </Grid>
                            </>}

                            <Grid item xs={6}>
                                <TextField id="allowed-ip-address" label="Allowed user IP address" type="text"
                                        variant="outlined"
                                        fullWidth
                                        onChange={handleChangeAllowedIPAddress}
                                        value={formState.allowedIPAddress} 
                                        helperText="Example: 192.168.1.0/24, 10.10.1.2/32" />
                            </Grid>

                            <Grid item xs={6}>
                                <CheckboxesTags id="usergroups" label="User Groups" placeholder="Group Name" items={items}
                                                fullWidth
                                                selectedIds={tags} onChange={handleChangeTags}/>
                            </Grid>

                            <Grid item xs={6} >
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <JalaliDatePicker
                                        onChange={handleChangeExpiresAt}
                                        label="Account expiry date"
                                        value={formState.expiresAt}
                                        id="expiresAt"
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>

                            <Grid item xs={6}>
                                <FormControl component="fieldset">
                                    <FormGroup style={{padding: "1em 2em"}}>
                                        <FormControlLabel
                                            control={<Switch checked={formState.isDisabled} onChange={handleChangeIsDisabled} name="is-disabled"/>}
                                            label="Account is disabled"
                                        />
                                    </FormGroup>
                                    { formState.authType === "internal" &&
                                        <FormGroup style={{padding: "1em 2em"}}>
                                            <FormControlLabel
                                                control={<Switch checked={formState.mustChangePassword} onChange={handleMustChangePassword} name="mustChangePassword"/>}
                                                label="User must change password on next sign in"
                                            />
                                        </FormGroup>
                                    }
                                </FormControl>
                            </Grid>



                        </Grid>

                        <BottomToolbar backLinkUrl="/dashboard/users" onClickDone={handleFormSubmit}
                                       inProgress={inProgress} extraButtons={ExtraButtons}/>

                    </form>
                </div>
            </Paper>

            <Snackbar
                open={snackbarState.isOpen}
                // onClose={handleSnackbarClose}
                // TransitionComponent={(<Slide direction="up" />)}
                message={snackbarState.message}
                // key={SlideTransition.name}
            />
        </div>


    )
}

export default UserEdit
