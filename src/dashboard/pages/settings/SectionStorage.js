import React, {useEffect, useState} from 'react'
import {Button, Divider, FormLabel, Grid, Paper, Snackbar} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import TopToolbar from '../../shared-components/TopToolbar';
import {gql, useMutation, useQuery} from '@apollo/client';
import {ArtTrack, DataUsage, DeleteSweep, Image} from "@material-ui/icons";
import JalaliDatePicker from "../../../utilities/JalaliDatePicker";
import {formatBytes} from "../../../utilities/Utils";

const ACTION_MGMT_DISK_INFO = gql`
{
  action_mgmt_disk_info {
    meta
  }
}
`;

const ACTION_MGMT_DISK_CLEANUP = gql`
mutation {
  action_mgmt_disk_cleanup {
    success
  }
}
`;

const ACTION_MGMT_DISK_EXPORT_RECORDINGS = gql`
mutation ($params: json) {
  action_mgmt_disk_export_recordings(params: $params) {
    meta
    success
  }
}
`;

const ACTION_MGMT_DISK_IMPORT_RECORDINGS = gql`
mutation {
  action_mgmt_disk_import_recordings {
    success
  }
}
`;

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

const SectionStorage = () => {
    const classes = useStyles();
    const [snackbarState,] = useState({isOpen: false,message: ''});
    const {data} = useQuery(ACTION_MGMT_DISK_INFO);
    const [actionDiskCleanup,] = useMutation(ACTION_MGMT_DISK_CLEANUP);
    const [actionDiskExportRecordings,] = useMutation(ACTION_MGMT_DISK_EXPORT_RECORDINGS);
    const [actionDiskImportRecordings,] = useMutation(ACTION_MGMT_DISK_IMPORT_RECORDINGS);
    const [disk, setDisk] = useState({});
    const [formState, setFormState] = React.useState({
        daysToKeepRecordings: '',
        cleanupInProgress: false,
        exportInProgress: false,
        importInProgress: false,
        dateFrom: null,
        dateTo: null
    });
    const [validationErrorState, setValidationErrorState] = React.useState({
        daysToKeepRecordings: false,
    });

    useEffect(() => {
        if (data?.action_mgmt_disk_info?.meta?.[0] ) {
            setDisk(s => ({...s, system: data?.action_mgmt_disk_info?.meta?.[0]}));
        }
        if (data?.action_mgmt_disk_info?.meta?.[1] ) {
            setDisk(s => ({...s, store: data?.action_mgmt_disk_info?.meta?.[1]}));
        }
    }, [data])

    const handleChangeField = e => {
        const name = e.target.name;
        const value = (e.target.type === 'checkbox') ? e.target.checked : e.target.value;
        setFormState(s => ({
            ...s, [name]: value
        }));
        const setAll = (obj, val) => Object.keys(obj).forEach(k => obj[k] = val);
        setValidationErrorState(s => {
            setAll(s, false);
            return s;
        });
    };

    const handleClickDiskCleanup = async () => {
        const confirmCleanup = window.confirm("WARNING:\nDisk cleanup is recommended when there are no LIVE sessions.\nAre you sure?")
        if (!confirmCleanup) return;
        setFormState(s => ({...s, cleanupInProgress: true}) );
        try {
            const result = await actionDiskCleanup();
            console.log(result);
        } catch (e) {
            console.log(e)
        }
        setFormState(s => ({...s, cleanupInProgress: false}) );
        alert('Disk cleanup completed.')
    }

    const handleClickExportRecordings = async () => {
        const dateFrom = formState.dateFrom?.startOf('day');
        const dateTo   = formState.dateTo?.endOf('day');
        if (!(dateFrom <= dateTo)) {
            setValidationErrorState( s => ({...s, dateFrom: true, dateTo: true}));
            return;
        }
        const confirmExport = window.confirm("WARNING:\nRecordings CAN NOT be played after you exported them!\nAre you sure?")
        if (!confirmExport) return;
        setFormState(s => ({...s, exportInProgress: true}) );
        try {
            const result = await actionDiskExportRecordings({variables: {params: {dateFrom, dateTo}}})
            console.log(result);
        } catch (e) {
            console.log(e)
        }
        setFormState(s => ({...s, exportInProgress: false}) );
        alert('Recordings export completed.')
    }

    const handleClickImportRecordings = async () => {
        const confirmImport = window.confirm("Move recording files in shared directory to storage?")
        if (!confirmImport) return;
        setFormState(s => ({...s, importInProgress: true}) );
        let result;
        try {
            result = await actionDiskImportRecordings();
            console.log(result);
        } catch (e) {
            console.log(e);
        }
        setFormState(s => ({...s, importInProgress: false}) );
        if (result?.data?.action_mgmt_disk_import_recordings?.success === true)
            alert('Recordings import completed.')
        else
            alert('Import failed see browser console for error details')
    }

    return (
    <Paper className={classes.paper}>
        <TopToolbar toolbarTitle="Storage Management"
                    toolbarIcon={<DataUsage style={{margin: '-4px 8px'}}/>}
                    backLinkUrl={'/dashboard/settings'} />

        <div className={classes.root}>
            <form className={classes.form} noValidate autoComplete="off" >
                <FormLabel component="legend">
                    Storage information and cleanup
                </FormLabel>

                <Grid container spacing={3}>

                    <Grid item xs={6}>
                        <ul>
                            <li>
                                <span> System disk information </span>
                                <ul>
                                    <li>
                                        Used Space: {formatBytes( disk?.system?.used )}
                                    </li>
                                    <li>
                                        Available Space: {formatBytes( disk?.system?.available )}
                                    </li>
                                    <li>
                                        Used Capacity: {disk?.system?.capacity}
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </Grid>

                    <Grid item xs={6}>
                        <ul>
                            <li>
                                <span> Store disk information </span>
                                <ul>
                                    <li>
                                        Used Space: {formatBytes( disk?.store?.used )}
                                    </li>
                                    <li>
                                        Free Space: {formatBytes( disk?.store?.available )}
                                    </li>
                                    <li>
                                        Used Capacity: { disk?.store?.capacity }
                                    </li>
                                </ul>
                            </li>
                        </ul>
                        {/* <Button
                            variant="outlined"
                            color="primary"
                            size="medium"
                            className={classes.button}
                            startIcon={<DeleteSweep/>}
                            style={{margin: 12}}
                            onClick={handleClickDiskCleanup}
                            disabled={formState.cleanupInProgress}
                        >
                            Disk cleanup
                        </Button> */}
                    </Grid>
                </Grid>

                {/* <Divider style={{margin: '2em'}} />
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormLabel component="legend">
                            Export recordings to shared directory
                        </FormLabel>
                    </Grid>

                    <Grid item xs={4}>
                        <JalaliDatePicker
                            onChange={(v) => handleChangeField({target: {name:"dateFrom", value:v}})}
                            label="From date" value={formState.dateFrom} size="small"
                            error={validationErrorState.dateFrom} />
                    </Grid>

                    <Grid item xs={4}>
                        <JalaliDatePicker
                            onChange={(v) => handleChangeField({target: {name:"dateTo", value:v}})}
                            label="To date" value={formState.dateTo} size="small"
                            error={validationErrorState.dateFrom} />
                    </Grid>

                    <Grid item xs={4}>
                        <Button
                            variant="outlined"
                            color="primary"
                            className={classes.button}
                            startIcon={<ArtTrack/>}
                            style={{margin: 17}}
                            onClick={handleClickExportRecordings}
                            disabled={formState.exportInProgress}
                        >
                            Export recordings
                        </Button>
                    </Grid>
                </Grid>

                <Divider style={{margin: '2em'}} />
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormLabel component="legend" >
                            Import recordings from shared directory
                        </FormLabel>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="medium"
                            className={classes.button}
                            startIcon={<Image/>}
                            style={{margin: 12}}
                            onClick={handleClickImportRecordings}
                            disabled={formState.importInProgress}
                        >
                            Import recordings from shared directory
                        </Button>
                    </Grid>
                </Grid> */}
            </form>
        </div>
        <Snackbar open={snackbarState.isOpen} message={snackbarState.message} />
    </Paper>
    )
}

export default SectionStorage
