import React, {useRef, useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import gql from 'graphql-tag';
import {useMutation, useQuery} from '@apollo/client';

import Tower from './tower.jpg';
import AlertDialog from "./AlertDialog";
import PasswordTextField from "../dashboard/shared-components/PasswordTextField";

// const ACTION_AUTH_SIGN_IN = gql`
// mutation ACTION_AUTH_SIGN_IN ($password: String!, $username: String!, $extra: json, $panel: String) {
//     action_auth_sign_in(credentials: {password: $password, username: $username, extra: $extra, panel: $panel}) {
//       success
//       authToken
//     }
// }  
// `; 

const ACTION_AUTH_SIGN_IN = gql`
mutation ACTION_AUTH_SIGN_IN ($password: String!, $username: String!, $extra: json) {
    action_auth_sign_in(credentials: {password: $password, username: $username, extra: $extra}) {
      success
      authToken
    }
}  
`; 

const QUERY_BRANDING_LOGO = gql`
  {
    settings (where: {name: { _eq: "brandingLogo"}}) {
      value
    }
  }  
`; 

const QUERY_BRANDING_BACKGROUND = gql`
  {
    settings (where: {name: { _eq: "brandingBackground"}}) {
      value
    }
  }  
`;

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © Raja IT '}
            {new Date().getFullYear()}
            <i> - v1.32.3 </i>
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
    },
    image: {
        backgroundRepeat: 'no-repeat',
        backgroundColor:
            theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    paper: {
        margin: theme.spacing(2, 4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    wrapper: {
        margin: theme.spacing(1),
        position: 'relative',
    },
    buttonProgress: {
        color: theme.palette.primary.main,
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -7,
        marginLeft: -12,
    },
    brandingLogo: {
        maxWidth: '100%', maxHeight: '26vh'
    }

}));

export default function SignInSide({onSignIn}) {
    const classes = useStyles();

    const usernameFieldRef = useRef();
    const passwordFieldRef = useRef();
    const rememberFieldRef = useRef();
    const oneTimePasswordFieldRef = useRef();

    const [oneTimePasswordShown, setOneTimePasswordShown] = useState(false)
    const [loading, setLoading] = React.useState(false);

    const [doSignIn,] = useMutation(ACTION_AUTH_SIGN_IN);

    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const handleDialogClose = () => {
        setAlertDialogOpen(false);
    }

    const [brandingLogoSrc, setBrandingLogoSrc] = useState('');
    const [brandingBackgroundSrc, setBrandingBackgroundSrc] = useState('');
    const {data: brandingLogoData} = useQuery(QUERY_BRANDING_LOGO);
    const {data: brandingBackgroundData} = useQuery(QUERY_BRANDING_BACKGROUND);

    React.useEffect(() => {
        const src = brandingLogoData?.settings?.[0]?.value;
        if (!src) return;
        const srcIsValid = src.startsWith('data:image/jpeg') || src.startsWith('data:image/png');
        if (!srcIsValid) return;
        setBrandingLogoSrc(src);
    }, [brandingLogoData])

    React.useEffect(() => {
        const src = brandingBackgroundData?.settings?.[0]?.value;
        if (!src) return;
        const srcIsValid = src.startsWith('data:image/jpeg') || src.startsWith('data:image/png');
        if (!srcIsValid) return;
        setBrandingBackgroundSrc(src);
    }, [brandingBackgroundData])

    const onSignInFormSubmit = async (e) => {
        e.preventDefault();
        const username = usernameFieldRef.current.value;
        const password = passwordFieldRef.current.value;
        const remember = rememberFieldRef.current.checked;
        const oneTimePassword = oneTimePasswordFieldRef.current.value;
        setLoading(true);
        try {
            // const result = await doSignIn({variables: {username, password, extra: {remember, oneTimePassword}, panel:'admin'} });
            const result = await doSignIn({variables: {username, password, extra: {remember, oneTimePassword}} });
            console.log(result);
            // for development environment with remote backends
            // auth-service should send AuthToken in response body in addition to http-only cookie
            // const signInResult = result.data.action_auth_sign_in;
            const authToken = result?.data?.action_auth_sign_in?.authToken;
            if (authToken)
                window.localStorage.setItem('AuthToken', authToken);

            setTimeout(onSignIn, 100);
        } catch (e) {
            if (e.message === 'One time password missing') {
                setOneTimePasswordShown(true);
            } else {
                setAlertDialogOpen(true);
                setAlertMessage(e.message);
            }
        }
        setLoading(false);
    };

    const loginBackground = brandingBackgroundSrc ? `url("${brandingBackgroundSrc}")` : `url(${Tower})`;

    return (
        <>
        <Grid container component="main" className={classes.root}>
            <CssBaseline/>
            <Grid item xs={false} sm={4} md={7} className={classes.image} style={{backgroundImage: loginBackground}} />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <div className={classes.paper}>
                    { brandingLogoSrc &&
                        <img src={brandingLogoSrc} className={classes.brandingLogo}/>
                    }
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <form className={classes.form} noValidate onSubmit={onSignInFormSubmit}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            inputRef={usernameFieldRef}
                        />

                        <PasswordTextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            id="password"
                            autoComplete="current-password"
                            inputRef={passwordFieldRef}
                        />

                        <TextField
                            style={{display: oneTimePasswordShown? 'block' : 'none'}}
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="oneTimePassword"
                            label="One time password"
                            type="text"
                            id="oneTimePassword"
                            autoComplete="off"
                            inputRef={oneTimePasswordFieldRef}
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary"/>}
                            label="Remember me"
                            inputRef={rememberFieldRef}
                        />
                        <div className={classes.wrapper}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                className={classes.submit}
                            >
                                Sign In
                            </Button>
                            {loading && <CircularProgress size={24} className={classes.buttonProgress}/>}
                        </div>

                        {/* <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid> */}
                        <Box mt={5}>
                            <Copyright/>
                        </Box>
                    </form>
                </div>
            </Grid>
        </Grid>

        <AlertDialog isOpen={alertDialogOpen} closeMe={handleDialogClose} message={alertMessage} />
        </>
    );
}