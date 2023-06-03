import React from 'react';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import {Grid} from "@material-ui/core";

export default function AccessRuleOptions(props) {
    const {canUpload, canDownload, canCopy, canPaste, onChange, record, excludeKeystrokes, transparentMode} = props;
    const handleChange = onChange;

    if(!transparentMode){
        return (
            <Grid container>

                <Grid item md={6} lg={4}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">File Transfer Access</FormLabel>
                        <FormGroup style={{padding: "1em 2em"}}>
                            <FormControlLabel
                                control={<Switch checked={canUpload} onChange={handleChange} name="canUpload"/>}
                                label="Upload files to connection"
                            />
                            <FormControlLabel
                                control={<Switch checked={canDownload} onChange={handleChange} name="canDownload"/>}
                                label="Download files from connection"
                            />
                        </FormGroup>
                    </FormControl>
                </Grid>

                <Grid item md={6} lg={4}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Clipboard Access</FormLabel>
                        <FormGroup style={{padding: "1em 2em"}}>
                            <FormControlLabel
                                control={<Switch checked={canPaste} onChange={handleChange} name="canPaste"/>}
                                label="Paste to connection"
                            />
                            <FormControlLabel
                                control={<Switch checked={canCopy} onChange={handleChange} name="canCopy"/>}
                                label="Copy from connection"
                            />
                        </FormGroup>
                    </FormControl>
                </Grid> 

                <Grid item md={6} lg={4}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Record session</FormLabel>
                        <FormGroup style={{padding: "1em 2em"}}>
                            <FormControlLabel
                                control={<Switch checked={record} onChange={handleChange} name="record"/>}
                                label="Record session screen"
                            />
                            <FormControlLabel
                                control={<Switch checked={excludeKeystrokes} onChange={handleChange} name="excludeKeystrokes"/>}
                                label="Don't record key strokes"
                            />
                        </FormGroup>
                    </FormControl>
                </Grid>


            </Grid>
        );
    }
}