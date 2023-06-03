import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import {Grid, MenuItem, TextField, Typography} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {gql} from "@apollo/client";
import PasswordTextField from "../../shared-components/PasswordTextField";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
}));

const ACTION_AUTH_ENCRYPT = gql`
query ACTION_AUTH_STATUS {
    action_auth_status {
        id
        role
        username
        meta
    }
}
`;

export default function ConnectionCredentials({onChange, credentialsType, credentialsUsername, credentialsPassword, credentialsKey, protocol, hasFeatureTtransparentMode}) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <Accordion elevation={3}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography className={classes.heading}>
                        Connection Credentials 
                    </Typography>
                </AccordionSummary>

                <AccordionDetails>

                    <Grid container spacing={2}>
                        <Grid item xs={8}>
                            <TextField
                                name="credentialsType"
                                select
                                label="Credentials Type"
                                value={credentialsType}
                                onChange={onChange}
                                variant="outlined"
                                fullWidth >
                                <MenuItem key='none' value='none'>
                                    None
                                </MenuItem>

                                {(protocol === "rdp") && <>
                                    <MenuItem key='usernamePassword' value='usernamePassword'>
                                        Username & Password  {hasFeatureTtransparentMode && <p style={{color: "gray", fontSize: '12px', paddingLeft: '8px'}}> (Just for none transparent connections)</p> }  
                                    </MenuItem>
                                    <MenuItem key='key' value='key'>
                                        Private Key  {hasFeatureTtransparentMode && <p style={{color: "gray", fontSize: '12px', paddingLeft: '8px'}}> (Just for none transparent connections)</p> } 
                                    </MenuItem>
                                </>}

                                {(protocol !== "rdp") && <>
                                    <MenuItem key='usernamePassword' value='usernamePassword'>
                                        Username & Password 
                                    </MenuItem>
                                    <MenuItem key='key' value='key'>
                                        Private Key
                                    </MenuItem>
                                </>}
                               
                            </TextField>
                        </Grid>

                        { credentialsType === 'usernamePassword' &&
                        <>
                            <Grid item xs={4}>
                                <TextField name="credentialsUsername" label="Credentials Username" variant="outlined" fullWidth
                                           onChange={onChange} value={credentialsUsername} />
                            </Grid>
                            <Grid item xs={4}>
                                <PasswordTextField name="credentialsPassword"
                                                   label="Credentials Password"
                                                   variant="outlined" fullWidth
                                                   onChange={onChange} value={credentialsPassword}/>
                            </Grid>
                        </>
                        }

                        { credentialsType === 'key' &&
                        <Grid item xs={8}>
                            <TextField name="credentialsKey" label="Private Key" variant="outlined" fullWidth
                                       onChange={onChange} value={credentialsKey}/>
                        </Grid>
                        }

                    </Grid>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}