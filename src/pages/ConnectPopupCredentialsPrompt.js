import React, {useRef} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import {Grid} from '@material-ui/core';

function preventDefault(event) {
    event.preventDefault();
}

const useStyles = makeStyles({
    depositContext: {
        flex: 1,
    },
    wrapper: {
        margin: '1em 0',
        position: 'relative',
    },
    buttonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
});

export default function ConnectPopupCredentialsPrompt({onSubmit, defaultDomain, loading}) {
    const classes = useStyles();
    const usernameFieldRef = useRef();
    const passwordFieldRef = useRef();
    const rememberFieldRef = useRef();

    const onClickConnect = e => {
        e.preventDefault();
        const username = usernameFieldRef.current.value;
        const password = passwordFieldRef.current.value;
        onSubmit(username, password);
    }
    return (
        <React.Fragment>
                    <form className={classes.form} noValidate onSubmit={onClickConnect}>
                        <Typography className={classes.title} variant="h6" id="tableTitle" component="div"
                                    style={{textAlign: 'left'}}>
                                        Connection Login
                        </Typography>
                        <br></br>
                        <Grid container spacing={0}>
                            <Grid  item  xs={12}>
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
                            </Grid>
                            {/* <Grid item  xs={1}>@</Grid>
                            <Grid item  xs={5}>
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    id="domain"
                                    label="Domain"
                                    name="domain"
                                    autoComplete="domain"
                                    inputRef={usernameFieldRef}
                                />
                            </Grid> */}
                            <Grid  item  xs={12}>
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    inputRef={passwordFieldRef}
                                />
                            </Grid>
                            
                            <Grid  item  xs={12}>
                                <div className={classes.wrapper}>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        disabled={loading}
                                        className={classes.submit}
                                    >
                                        Connect
                                    </Button>
                                    {loading && <CircularProgress size={24} className={classes.buttonProgress}/>}
                                </div>
                            </Grid>

                        </Grid>
                    </form>
        </React.Fragment>
    );
}
