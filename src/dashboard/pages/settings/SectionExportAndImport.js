import React from 'react'
import GetAppIcon from '@material-ui/icons/GetApp';
import PublishIcon from '@material-ui/icons/Publish';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import {Button, Grid, Paper} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import TopToolbar from '../../shared-components/TopToolbar';
import BottomToolbar from './BottomToolbar';
import {gql, useApolloClient, useLazyQuery, useMutation} from '@apollo/client';
import useFrontLogs from '../logs/FrontLogs';

const QUERY_ALL_CONFIGURATION_DATA = gql`
  query {
    access_rule_connection {
      access_rule_id
      connection_id
    }
    access_rule_connection_group {
      access_rule_id
      connection_group_id
    }
    access_rule_user {
      access_rule_id
      user_id
    }
    access_rule_user_group {
      access_rule_id
      user_group_id
    }
    access_rules {
      id
      created_at
      meta
      name
    }
    connection_group_connection {
      connection_group_id
      connection_id
    }
    connection_groups {
      created_at
      description
      id
      name
    }
    connections {
      created_at
      hostname
      id
      meta
      name
      protocol
    }
    settings {
      id
      name
      type
      user_id
      value
    }
    user_group_user {
      user_group_id
      user_id
    }
    user_groups {
      created_at
      description
      id
      name
    }
    users {
      created_at
      id
      meta
      name
      password
      role
      username
    }
  }
`;

const SAMPLE_INSERT = gql`
  mutation ($objects: [input!] = {}) {
    insert(objects: $objects) {
      affected_rows
    }
  }
`;

const QUERY_SESSIONS = gql`
query ($offset: Int!, $limit: Int!) {
  sessions(limit: $limit, offset: $offset, order_by: {created_at: asc}) {
    access_rule_id
    connection_id
    created_at
    id
    meta
    status
    user_id
  }
}
`;

const QUERY_LOGS = gql`
query ($offset: Int!, $limit: Int!) {
  logs(limit: $limit, offset: $offset, order_by: {created_at: asc}) {
    created_at
    id
    meta
    service
    type
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

function download(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
}

const toText = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

const SectionExportAndImport = ({loggedInUser}) => {
  
    const frontLogs = useFrontLogs();
    const classes = useStyles();
    const [inProgress, setInProgress] = React.useState(false);
    const inputFileEl = React.useRef();
    const [query, setQuery] = React.useState(SAMPLE_INSERT);

    const [queryAllConfigurationData, ] = useLazyQuery(QUERY_ALL_CONFIGURATION_DATA, {

        onCompleted: async (data) => {

          const datetime = new Date().toLocaleString().slice(0, 19);
          download(`PAM-export-configuration-${datetime}.pam`, JSON.stringify(data));
          await frontLogs('configuration exported', `configuration Data exported and downloaded : PAM-export-configuration-${datetime}.pam`, {"filename": `PAM-export-configuration-${datetime}.pam`}, null, `${loggedInUser?.id}`, `${loggedInUser?.username}`);
        }
    });

    const [generalInsert,] = useMutation(query);

    const handleExportData = async () => {
        await queryAllConfigurationData();
    }

    const gqlClient = useApolloClient();

    const handleClickExportSessions = async () => {
        const limit = 2000;
        const allRows = [];
        let offset = 0;
        let hasMoreRows = true;
        while (hasMoreRows) {
            const variables = {limit, offset};
            const data = await gqlClient.query({query: QUERY_SESSIONS, variables})
            const newRows = data?.data?.sessions;
            if (!newRows?.[0]) break;
            allRows.push(...newRows);
            hasMoreRows = (newRows?.length >= limit);
            offset += limit;
        }
        const datetime = new Date().toLocaleString().slice(0, 19);
        download(`PAM-export-sessions-${datetime}.pam`, JSON.stringify({sessions: allRows}));

        await frontLogs('Sessions exported', `Sessions Data exported and downloaded : PAM-export-sessions-${datetime}.pam`, {"filename": `PAM-export-sessions-${datetime}.pam`}, null, `${loggedInUser?.id}`, `${loggedInUser?.username}`);

    }

    const handleClickExportLogs = async () => {
        const limit = 2000;
        const allRows = [];
        let offset = 0;
        let hasMoreRows = true;
        while (hasMoreRows) {
            const variables = {limit, offset};
            const data = await gqlClient.query({query: QUERY_LOGS, variables})
            const newRows = data?.data?.logs;
            if (!newRows?.[0]) break;
            allRows.push(...newRows);
            hasMoreRows = (newRows?.length >= limit);
            offset += limit;
        }
        const datetime = new Date().toLocaleString().slice(0, 19);
        download(`PAM-export-logs-${datetime}.pam`, JSON.stringify({logs: allRows}));

        await frontLogs('Logs exported', `Logs Data exported and downloaded : PAM-export-logs-${datetime}.pam`, {"filename": `PAM-export-logs-${datetime}.pam`}, null, `${loggedInUser?.id}`, `${loggedInUser?.username}`);
    }

    const handleFormSubmitImport = async data => {
        setInProgress(true);
        const file = inputFileEl.current.files[0];
        if (!file) {
            alert('No file selected!\nUse "Import" button to select file, then click "Done"');
            setInProgress(false);
            return;
        }
        let json = {};
        try {
            const text = await toText(file);
            json = JSON.parse(text);
        } catch (e) {
            alert(e.message);
        }

        let stats = {count: 0, failed: 0};
        const tables = ['users', 'user_groups', 'connections', 'connection_groups', 'access_rules',
        'user_group_user', 'connection_group_connection', 'access_rule_user', 'access_rule_connection', 'access_rule_user_group', 'access_rule_connection_group'];
        for (const table of tables) {
            const tableRows = json[table] ?? [];
            tableRows.forEach(i => {delete i?.__typename});
            setQuery(gql`
                mutation ($objects: [${table}_insert_input!] = {}) {
                    insert_${table}(objects: $objects) {
                        affected_rows
                    }
                }
            `);

            for (const tableRow of tableRows) {
                stats.count++;
                try {
                    await generalInsert({variables: {objects: [tableRow]}});
                } catch (e) {

                    await frontLogs('Import Data field failed', `Insert into ${table} failed : ${e.message}`, {"error": e.message}, null, `${loggedInUser?.id}`, `${loggedInUser?.username}`);
                    console.log(`Insert into ${table} failed`, tableRow, e.message);
                    stats.failed++;
                }
            }
        }
        if (stats.failed > 0) {
            alert(`Some insertions failed (${stats.failed} / ${stats.count}). See System Logs for error details`);
        }
        setInProgress(false);
    };

    return (
    <Paper className={classes.paper}>
        <TopToolbar toolbarTitle="Export and Import Configuration"
                    toolbarIcon={<ImportExportIcon style={{margin: '-4px 8px'}}/>}
                    backLinkUrl={'/dashboard/settings'} />

        <div className={classes.root}>
            <form className={classes.form} noValidate autoComplete="off"
                  onSubmit={handleFormSubmitImport}>

                <Grid container spacing={3}>

                    <Grid item xs={12} style={{textAlign: 'center'}}>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="medium"
                            className={classes.button}
                            startIcon={<GetAppIcon/>}
                            style={{margin: 12}}
                            onClick={handleExportData}
                        >
                            Export configuration
                        </Button>

                        <Button
                          variant="outlined"
                          color="primary"
                          component="label"
                          startIcon={<PublishIcon/>}
                        >
                          Import configuration
                          <input
                            ref={inputFileEl}
                            type="file"
                            hidden
                          />
                        </Button>
                    </Grid>

                    <Grid item xs={12} style={{textAlign: 'center'}}>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="medium"
                            className={classes.button}
                            startIcon={<GetAppIcon/>}
                            style={{margin: 12}}
                            onClick={handleClickExportSessions}
                        >
                            Export sessions
                        </Button>

                        {/*<Button*/}
                        {/*  variant="outlined"*/}
                        {/*  color="primary"*/}
                        {/*  component="label"*/}
                        {/*  startIcon={<PublishIcon/>}*/}
                        {/*>*/}
                        {/*  Import sessions*/}
                        {/*  <input*/}
                        {/*    ref={inputFileEl}*/}
                        {/*    type="file"*/}
                        {/*    hidden*/}
                        {/*  />*/}
                        {/*</Button>*/}
                    </Grid>

                    <Grid item xs={12} style={{textAlign: 'center'}}>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="medium"
                            className={classes.button}
                            startIcon={<GetAppIcon/>}
                            style={{margin: 12}}
                            onClick={handleClickExportLogs}
                        >
                            Export logs
                        </Button>

                        {/*<Button*/}
                        {/*  variant="outlined"*/}
                        {/*  color="primary"*/}
                        {/*  component="label"*/}
                        {/*  startIcon={<PublishIcon/>}*/}
                        {/*>*/}
                        {/*  Import logs*/}
                        {/*  <input*/}
                        {/*    ref={inputFileEl}*/}
                        {/*    type="file"*/}
                        {/*    hidden*/}
                        {/*  />*/}
                        {/*</Button>*/}
                    </Grid>


                </Grid>

                <BottomToolbar onClickDone={handleFormSubmitImport}
                               inProgress={inProgress}/>

            </form>
        </div>
    </Paper>

    )
}

export default SectionExportAndImport
