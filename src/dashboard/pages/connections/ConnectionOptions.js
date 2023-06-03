import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import {
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Grid,
    MenuItem,
    Switch,
    TextField,
    Typography
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
}));

export default function ConnectionOptions(params) {
    const {onChange, ignoreCert, enableFontSmoothing, security, remoteAppProgram, remoteAppParameters, remoteAppPath, hasFeatureTtransparentMode} = params;
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
                        Options for RDP Connection {hasFeatureTtransparentMode && <p style={{color: "gray", fontSize: '12px', paddingLeft: '8px'}}> (Just for none transparent connections)</p> }  
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>

                        <Grid item md={4}>
                            <TextField
                                id="security"
                                name="security"
                                select
                                label="Security Mode"
                                value={security}
                                onChange={onChange}
                                variant="outlined"
                                fullWidth>
                                <MenuItem key='nla' value='nla'>
                                    NLA
                                </MenuItem>
                                <MenuItem key='tls' value='tls'>
                                    RDP
                                </MenuItem>
                                <MenuItem key='basic' value='basic'>
                                    TLS
                                </MenuItem>
                                <MenuItem key='none' value='none'>
                                    Any
                                </MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item md={4}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">
                                    Font smoothing
                                </FormLabel>
                                <FormGroup style={{padding: "1em 2em"}}>
                                    <FormControlLabel
                                        control={<Switch checked={enableFontSmoothing} onChange={onChange} name="enableFontSmoothing"/>}
                                        label="Enable font smoothing"
                                    />
                                </FormGroup>
                            </FormControl>
                        </Grid>

                        <Grid item md={4}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Server certification</FormLabel>
                                <FormGroup style={{padding: "1em 2em"}}>
                                    <FormControlLabel
                                        control={<Switch checked={ignoreCert} onChange={onChange} name="ignoreCert"/>}
                                        label="Ignore certification"
                                    />
                                </FormGroup>
                            </FormControl>
                        </Grid>

                        {/*<Grid item xs={4}>*/}
                        {/*    <FormControl component="fieldset">*/}
                        {/*        <FormLabel component="legend">RDP credentials prompt</FormLabel>*/}
                        {/*        <FormGroup style={{padding: "1em 2em"}}>*/}
                        {/*            <FormControlLabel*/}
                        {/*                control={<Switch checked={promptCredentials} onChange={onChange} name="promptCredentials"/>}*/}
                        {/*                label="Prompt for username and password"*/}
                        {/*            />*/}
                        {/*        </FormGroup>*/}
                        {/*    </FormControl>*/}
                        {/*</Grid>        */}

                        <Grid item md={4}>
                            <TextField id="remote-app-program" name="remoteAppProgram" label="Remote App Program" variant="outlined" fullWidth
                                        onChange={onChange} value={remoteAppProgram}/>
                        </Grid>
                        <Grid item md={4}>
                            <TextField id="remote-app-program" name="remoteAppParameters" label="Remote App Parameters" variant="outlined" fullWidth
                                        onChange={onChange} value={remoteAppParameters}/>
                        </Grid>
                        <Grid item md={4}>
                            <TextField id="remote-app-program" name="remoteAppPath" label="Remote App Path" variant="outlined" fullWidth
                                        onChange={onChange} value={remoteAppPath}/>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}
